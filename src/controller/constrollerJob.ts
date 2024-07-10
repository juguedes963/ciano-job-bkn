import fs from 'fs'
import { Request, Response } from 'express'
interface IPropsJob {
    label: string
    value: string[]
}
interface IProJson {
    infosAdd: IPropsJob[]
    link: string
}
async function details(request: Request, response: Response) {
    const JsonDetailsFs: IProJson[] = JSON.parse(fs.readFileSync('infosJob.json', 'utf-8'))

    response.json(JsonDetailsFs)
}
export {
    details
}