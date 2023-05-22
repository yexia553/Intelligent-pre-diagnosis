from django.contrib import admin
from .models import WechatUser, PreDiagnosis


class WechatUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'openid')
    search_fields = ('user__username',)


class PreDiagnosisAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'answer')
    search_fields = ('user__user__username',)
    raw_id_fields = ('user',)


admin.site.register(WechatUser, WechatUserAdmin)
admin.site.register(PreDiagnosis, PreDiagnosisAdmin)
