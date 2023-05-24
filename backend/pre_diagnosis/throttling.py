from rest_framework.throttling import UserRateThrottle


class CustomHourlyThrottle(UserRateThrottle):
    scope = 'custom_hourly'
