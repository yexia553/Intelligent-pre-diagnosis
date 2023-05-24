from django.urls import path
from . import views

urlpatterns = [
    # path('pre_diagnosis/', views.pre_diagnosis, name='pre_diagnosis'),
    # path('login/', views.login, name='login'),
    path('pre_diagnosis/', views.PreDiagnosisAPIView.as_view(), name='pre_diagnosis'),
    path('login/', views.LoginAPIView.as_view(), name='login'),
]
