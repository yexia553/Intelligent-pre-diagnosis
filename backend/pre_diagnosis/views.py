from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import openai


openai.api_type = "azure"
openai.api_base = "xxxxxxxxxxxxxxx"
openai.api_version = "2023-03-15-preview"
openai.api_key = "xxxxxxxxxxxxxxx"


@api_view(['POST'])
def pre_diagnosis(request):
    res = ''
    if request.method == 'POST':
        question = request.query_params.get('question')
        try:
            response = openai.ChatCompletion.create(
                engine="xxxxxxxxxxxxx",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个资深的全科医生，我会告诉你一些当前的症状，请你结合你的经验，分析一下我应该去医院挂什么科室",
                    },
                    {"role": "user", "content": f"{question}"},
                ],
                temperature=0.5,
                max_tokens=800,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None,
            )
            res = response.choices[0].message._previous.get("content")
        except Exception as e:
            print(e)
            res = '系统繁忙，请稍后再试~'
    return Response({"res": res})
