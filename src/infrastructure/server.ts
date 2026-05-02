import express, { Router } from 'express'

export const createServer = (taskRouter: Router) => {
  const app = express()
  app.use(express.json())
  app.use('/tasks', taskRouter)
  return app
}
