from django.db import models
from django.contrib.auth.models import User


class WechatUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT)
    openid = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.user.username


class PreDiagnosis(models.Model):
    user = models.ForeignKey(WechatUser, on_delete=models.PROTECT)
    question = models.TextField()
    answer = models.TextField()

    def __str__(self):
        return self.question
