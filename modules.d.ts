declare namespace NodeJS {
	export interface ProcessEnv {
		PORT: string
		NODE_ENV: 'development' | 'production'
		MONGO_URI: string
		REDIS_URL: string
		REDIS_PASSWORD: string
		COOKIE_NAME: string
		COOKIE_MAXAGE_HOURS: string
		ALI_ID: string
		ALI_SECRET: string
		PHONE_TOKEN_EXPIRE_SECONDS: string
		PHONE_PREFIX: string
		PHONE_TOKEN_FREQUENCY_SECONDS: string
		PHONE_TOKEN_AT_TIME_PREFIX: string
		FRONTEND_URL: string
		REDIS_SECRET: string
		ALIPAY_CB: string
		alipayId: string
		BTC_INFO_REQUEST_URL: string
		AVATAR_URL: string
		// SERVER_URL: string
	}
}
