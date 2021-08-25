declare namespace NodeJS {
	export interface ProcessEnv {
		PORT: string
		NODE_ENV: 'development' | 'production'
		MONGO_URI: string
		REDIS_URL: string
		REDIS_PASSWORD: string
		// COOKIE_NAME: string
		COOKIE_MAXAGE_HOURS: string 
		// REDIS_SECRET: string
		// ALI_ID: string
		// ALI_SECRET: string

		PHONE_TOKEN_EXPIRE_SECONDS: string
		// PHONE_PREFIX: string
		PHONE_TOKEN_FREQUENCY_SECONDS: string
		// PHONE_TOKEN_AT_TIME_PREFIX: string
		FRONTEND_URL: string
		// PAGE_LIMIT: string
		// MAX_QUERY_COMPLEXITY: string
		// SMS_NAME: '洼盈科技' | '洼盈' | '曼德拉游戏'
		// alipayId: string
		// ALIPAY_CB: string
		// SERVER_URL: string
	}
}