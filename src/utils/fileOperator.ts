import path from 'path'
import xslx from 'xlsx'

/**
 *
 * @param filename
 * @returns json data.
 */
export const readXslxFile = (filename) => {
	const wb = xslx.readFile(
		path.join(__dirname, '..', '..', 'public', 'data', filename),
		{ cellDates: true }
	)
	const ws = wb.Sheets['Sheet1']
	return xslx.utils.sheet_to_json(ws)
}

/**
 *
 * @param data
 * @returns xlsx files
 */
export const toXlsxFile = (data) => {
	const fileName = path.join(
		__dirname,
		'..',
		'..',
		'public',
		'download',
		'test.xlsx'
	)
	xslx.writeFile(data, fileName)
	return 'test.xlsx'
}
