from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
import string
import secrets
import openai
import requests
from .models import PreDiagnosis, CustomUser
from .throttling import CustomHourlyThrottle


openai.api_type = settings.OPENAI_API_TYPE
openai.api_base = settings.OPENAI_API_BASE
openai.api_version = settings.OPENAI_API_VERSION
openai.api_key = settings.OPENAI_API_KEY


def generate_random_string(length):
    characters = string.ascii_letters + string.digits  # 包括字母和数字字符
    return ''.join(secrets.choice(characters) for _ in range(length))


class LoginAPIView(APIView):
    def post(self, request):
        code = request.query_params.get('code')
        nick_name = request.query_params.get('nickName')
        if not code:
            return Response({"error": "Missing authorization code"}, status=400)

        # 获取 access_token 和 openid
        token_url = f'https://api.weixin.qq.com/sns/jscode2session?appid={settings.WECHAT_APP_ID}&secret={settings.WECHAT_APP_SECRET}&js_code={code}&grant_type=authorization_code'
        response = requests.get(token_url)
        result = response.json()

        if 'errcode' in result:
            return Response(result, status=400)

        openid = result['openid']

        try:
            wechat_user = CustomUser.objects.get(openid=openid)
            user = wechat_user.user
        except CustomUser.DoesNotExist:
            random_password = generate_random_string(30)
            username_suffix = generate_random_string(5)
            user = CustomUser.objects.create_user(
                username=nick_name + username_suffix,
                openid=openid,
                password=random_password,
            )

        data = {
            "user_openid": openid,
            "username": user.username,
            "password": random_password,
        }
        return Response(data)


class PreDiagnosisAPIView(APIView):
    throttle_classes = [CustomHourlyThrottle]

    def post(self, request):
        res = ''
        question = request.query_params.get('question')
        openid = request.query_params.get('openid')
        try:
            response = openai.ChatCompletion.create(
                engine=settings.OPENAI_ENGINE_ID,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个资深的全科医生，\
                            我会告诉你一些当前的症状, \
                            请你结合你的经验，\
                            分析一下我应该去医院挂什么科室，\
                            如果我给你的信息不是跟预诊相关的，\
                            请你委婉但是坚定地拒绝回答，\
                            并且你不能在给出具体的治疗建议，\
                            只能告诉我应该挂什么科室",
                    },
                    {"role": "user", "content": f"{question}"},
                ],
                temperature=0.5,
                max_tokens=400,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
            )
            res = response.choices[0].message._previous.get("content")
        except Exception as e:
            print(e)
            res = '系统繁忙，请稍后再试~'
        finally:
            user = CustomUser.objects.get(openid=openid)
            pre_diagnosis_record = PreDiagnosis(
                user=user, question=question, answer=res
            )
            pre_diagnosis_record.save()

        return Response({"res": res})
