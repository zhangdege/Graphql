const request = require('request')

let stream
let partialMessage
const BASE_URL = 'https://cloud-sse.iexapis.com/stable'
const TYPE = 'cryptoQuotes'
const TOKEN = 'sk_dd288f8dd2c3469e8abc1ee038d97155'
const SYMBOLS = 'btcusdt'

const connect = () => {
	stream = request({
		url: `${BASE_URL}/${TYPE}?token=${TOKEN}&symbols=${SYMBOLS}`,
		headers: {
			'Content-Type': 'text/event-stream',
		},
	})
}
connect()

stream.on('socket', () => {
	console.log('Connected')
})

stream.on('end', () => {
	console.log('Reconnecting')
	connect()
})

stream.on('complete', () => {
	console.log('Reconnecting')
	connect()
})

stream.on('error', (err) => {
	console.log('Error', err)
	connect()
})

stream.on('data', (response) => {
	const chunk = response.toString()
	const cleanedChunk = chunk.replace(/data: /g, '')

	if (partialMessage) {
		cleanedChunk = partialMessage + cleanedChunk
		partialMessage = ''
	}

	const chunkArray = cleanedChunk.split('\r\n\r\n')

	chunkArray.forEach(function (message) {
		if (message) {
			try {
				const quote = JSON.parse(message)[0]
				console.log(quote)
			} catch (error) {
				partialMessage = message
			}
		}
	})
})

const wait = () => {
	setTimeout(wait, 1000)
}

wait()
