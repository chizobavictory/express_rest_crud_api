import express, {Request, Response} from 'express'
import logger from 'morgan'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(logger('dev'))
app.use(cookieParser())

app.get('/home', (req:Request, res:Response)=>{
  res.status(200).json({
    message: "Success"
  })
})


const port = 3500
app.listen(port, ()=>{
  console.log(`Server running on port: ${port}`)
})

export default app