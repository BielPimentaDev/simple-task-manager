import { JsonTaskRepository } from './infrastructure/persistence/task/JsonTaskRepository'
import { JsonCategoryRepository } from './infrastructure/persistence/category/JsonCategoryRepository'
import { CreateTaskUseCase } from './application/usecases/task/CreateTaskUseCase'
import { ListTasksUseCase } from './application/usecases/task/ListTasksUseCase'
import { GetTaskUseCase } from './application/usecases/task/GetTaskUseCase'
import { UpdateTaskUseCase } from './application/usecases/task/UpdateTaskUseCase'
import { DeleteTaskUseCase } from './application/usecases/task/DeleteTaskUseCase'
import { AddCategoryToTaskUseCase } from './application/usecases/task/AddCategoryToTaskUseCase'
import { RemoveCategoryFromTaskUseCase } from './application/usecases/task/RemoveCategoryFromTaskUseCase'
import { CreateCategoryUseCase } from './application/usecases/category/CreateCategoryUseCase'
import { ListCategoriesUseCase } from './application/usecases/category/ListCategoriesUseCase'
import { GetCategoryUseCase } from './application/usecases/category/GetCategoryUseCase'
import { UpdateCategoryUseCase } from './application/usecases/category/UpdateCategoryUseCase'
import { DeleteCategoryUseCase } from './application/usecases/category/DeleteCategoryUseCase'
import { TaskController } from './infrastructure/controllers/task/TaskController'
import { TaskCategoryController } from './infrastructure/controllers/task/TaskCategoryController'
import { TaskRoutes } from './infrastructure/controllers/task/TaskRoutes'
import { CategoryController } from './infrastructure/controllers/category/CategoryController'
import { CategoryRoutes } from './infrastructure/controllers/category/CategoryRoutes'
import { createServer } from './infrastructure/server'

const taskRepository = new JsonTaskRepository()
const categoryRepository = new JsonCategoryRepository()

const createTask = new CreateTaskUseCase(taskRepository)
const listTasks = new ListTasksUseCase(taskRepository, categoryRepository)
const getTask = new GetTaskUseCase(taskRepository, categoryRepository)
const updateTask = new UpdateTaskUseCase(taskRepository, categoryRepository)
const deleteTask = new DeleteTaskUseCase(taskRepository)
const addCategoryToTask = new AddCategoryToTaskUseCase(taskRepository, categoryRepository)
const removeCategoryFromTask = new RemoveCategoryFromTaskUseCase(taskRepository, categoryRepository)

const createCategory = new CreateCategoryUseCase(categoryRepository)
const listCategories = new ListCategoriesUseCase(categoryRepository)
const getCategory = new GetCategoryUseCase(categoryRepository)
const updateCategory = new UpdateCategoryUseCase(categoryRepository)
const deleteCategory = new DeleteCategoryUseCase(categoryRepository, taskRepository)

const taskController = new TaskController(createTask, listTasks, getTask, updateTask, deleteTask)
const taskCategoryController = new TaskCategoryController(addCategoryToTask, removeCategoryFromTask, getTask)
const categoryController = new CategoryController(createCategory, listCategories, getCategory, updateCategory, deleteCategory)

const taskRouter = TaskRoutes(taskController, taskCategoryController)
const categoryRouter = CategoryRoutes(categoryController)
const app = createServer(taskRouter, categoryRouter)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  process.stdout.write(`Server running on port ${PORT}\n`)
})
