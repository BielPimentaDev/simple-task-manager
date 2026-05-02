import { JsonTaskRepository } from './infrastructure/persistence/task/JsonTaskRepository'
import { CreateTaskUseCase } from './application/usecases/task/CreateTaskUseCase'
import { ListTasksUseCase } from './application/usecases/task/ListTasksUseCase'
import { GetTaskUseCase } from './application/usecases/task/GetTaskUseCase'
import { UpdateTaskUseCase } from './application/usecases/task/UpdateTaskUseCase'
import { DeleteTaskUseCase } from './application/usecases/task/DeleteTaskUseCase'
import { TaskController } from './infrastructure/controllers/task/TaskController'
import { TaskRoutes } from './infrastructure/controllers/task/TaskRoutes'
import { createServer } from './infrastructure/server'

const repository = new JsonTaskRepository()
const createTask = new CreateTaskUseCase(repository)
const listTasks = new ListTasksUseCase(repository)
const getTask = new GetTaskUseCase(repository)
const updateTask = new UpdateTaskUseCase(repository)
const deleteTask = new DeleteTaskUseCase(repository)

const controller = new TaskController(createTask, listTasks, getTask, updateTask, deleteTask)
const taskRouter = TaskRoutes(controller)
const app = createServer(taskRouter)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  process.stdout.write(`Server running on port ${PORT}\n`)
})
