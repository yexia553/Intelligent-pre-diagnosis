from rest_framework.decorators import api_view
from django.conf import settings
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import throttle_classes
from rest_framework.throttling import UserRateThrottle

import openai
import requests

from .models import WechatUser, User, PreDiagnosis


openai.api_type = settings.OPENAI_API_TYPE
openai.api_base = settings.OPENAI_API_BASE
openai.api_version = settings.OPENAI_API_VERSION
openai.api_key = settings.OPENAI_API_KEY


@api_view(['POST'])
def login(request):
    code = request.query_params.get('code')
    if not code:
        return Response({"error": "Missing authorization code"}, status=400)

    # 获取 access_token 和 openid
    token_url = f'https://api.weixin.qq.com/sns/oauth2/access_token?appid={settings.WECHAT_APP_ID}&secret={settings.WECHAT_APP_SECRET}&code={code}&grant_type=authorization_code'
    response = requests.get(token_url)
    result = response.json()

    if 'errcode' in result:
        return Response(result, status=400)

    openid = result['openid']

    # 创建新用户或返回现有用户
    try:
        wechat_user = WechatUser.objects.get(openid=openid)
        user = wechat_user.user
    except WechatUser.DoesNotExist:
        user = User.objects.create(username=openid)
        WechatUser.objects.create(user=user, openid=openid)

    token, _ = Token.objects.get_or_create(user=user)
    data = {
        "user_id": user.pk,
        "user_open_id": openid,
        "username": user.username,
        "token": token.key,
    }
    return Response(data)


@throttle_classes([UserRateThrottle])
def pre_diagnosis(request):
    res = ''
    if request.method == 'POST':
        question = request.query_params.get('question')
        try:
            response = openai.ChatCompletion.create(
                engine=settings.OPENAI_ENGINE_ID,
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个资深的全科医生，我会告诉你一些当前的症状，请你结合你的经验，分析一下我应该去医院挂什么科室",
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
            wechat_user = request.user.wechatuser
            pre_diagnosis_record = PreDiagnosis(
                user=wechat_user, question=question, answer=res
            )
            pre_diagnosis_record.save()
        except Exception as e:
            print(e)
            res = '系统繁忙，请稍后再试~'
    return Response({"res": res})
