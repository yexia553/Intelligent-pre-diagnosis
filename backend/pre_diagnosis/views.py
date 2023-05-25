from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
import string
import secrets
import openai
import requests
from .models import PreDiagnosis, CustomUser
from .throttling import CustomHourlyThrottle
import logging


logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)

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
            logging.info('没有获取到小程序code')
            return Response({"error": "Missing authorization code"}, status=400)

        # 获取 access_token 和 openid
        token_url = f'https://api.weixin.qq.com/sns/jscode2session?appid={settings.WECHAT_APP_ID}&secret={settings.WECHAT_APP_SECRET}&js_code={code}&grant_type=authorization_code'
        response = requests.get(token_url)
        result = response.json()

        if 'errcode' in result:
            logging.info('调用腾讯API认证小程序失败')
            return Response(result, status=400)

        openid = result['openid']
        session_key = result['session_key']

        random_password = generate_random_string(30)
        try:
            user = CustomUser.objects.get(username=openid)
            user.set_password(random_password)
            user.save()
            logging.info(f"{nick_name}: 该用户已经存在，从数据库获取信息")
            data = {
                "username": openid,
                "password": None,
                "session_key": session_key,
            }
            return Response(data)
        except CustomUser.DoesNotExist:
            logging.info(f"{nick_name}: 该用户不存在，尝试创建新用户")
            user = CustomUser.objects.create_user(
                username=openid,
                nick_name=nick_name,
                password=random_password,
            )
            logging.info(f"{nick_name}: 创建新用户成功")

            data = {
                "username": openid,
                "password": random_password,
                "session_key": session_key,
            }
            return Response(data)


class PreDiagnosisAPIView(APIView):
    throttle_classes = [CustomHourlyThrottle]
    throttle_scope = 'custom_hourly'

    def post(self, request):
        res = ''
        question = request.query_params.get('question')
        openid = request.query_params.get('openid')
        logging.info("成功获取question和openid")
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
            user = CustomUser.objects.get(username=openid)
            pre_diagnosis_record = PreDiagnosis(
                user=user, question=question, answer=res
            )
            pre_diagnosis_record.save()
            logging.info("预诊记录保存成功")

        return Response({"res": res})
