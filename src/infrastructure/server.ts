import express, { Router } from 'express'

export const createServer = (taskRouter: Router, categoryRouter?: Router) => {
  const app = express()
  app.use(express.json())
  app.use('/tasks', taskRouter)
  if (categoryRouter) {
    app.use('/categories', categoryRouter)
  }
  return app
}
