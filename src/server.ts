import express from 'express'
import cors from 'cors'
import routes from './routes'
import dotenv from 'dotenv'
const app = express()

dotenv.config()

const PORT = process.env.PORT || 3333


app.use(cors())
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(routes)

app.listen(PORT, () => {
    console.log("rodando na porta:" + PORT)
})