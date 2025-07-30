import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "../types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumnHeader } from "./Kanban-column-header";
import { KanbanCard } from "./kanban-card";
const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.PR_REVIEW,
  TaskStatus.DONE,
];
type TaskState = {
  [key in TaskStatus]: Task[];
};
interface DataKanbanProps {
  data: Task[];
  onChange: (tasks: { $id: string; status: TaskStatus; position:number}[]) => void;
}
export const DataKanban = ({ data,onChange }: DataKanbanProps) => {
  const [tasks, setTasks] = useState<TaskState>(() => {
    const initialTasks: TaskState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.PR_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });
    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort(
        (a, b) => a.position - b.position
      );
    });
    return initialTasks;
  });
  //update latest render data
  useEffect(() => {
    const newTasksData: TaskState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.PR_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    data.forEach((task) => {
      newTasksData[task.status].push(task);
    });
    Object.keys(newTasksData).forEach((status) => {
      newTasksData[status as TaskStatus].sort(
        (a, b) => a.position - b.position
      );
    });
    setTasks(newTasksData)
  },[data])
  // const onDrapEnd = useCallback((result:DropResult) => {
  //   const { source, destination } = result;
  //   const sourceStatus = source.droppableId as TaskStatus
  //   const destinationSource = destination?.droppableId as TaskStatus;
  //   let updatesPayload: { $id: string; status: TaskStatus; position: number }[] = [];
  //   setTasks((prevTask) => {
  //     const newTasks = { ...prevTask };
  //     // safely remove the task from source column
  //     const sourceColumn = [...newTasks[sourceStatus]];
  //     const [movedTask] = sourceColumn.splice(source.index, 1);
  //     // if we dont find the moved task return to previous state
  //     if (!movedTask) {
  //       console.error("No task found at the source index");
  //       return prevTask;
  //     }
  //     //create a new task object
  //     const updatedMovedTask =
  //       sourceStatus !== destinationSource
  //         ? { ...movedTask, status: destinationSource }
  //         : movedTask;
  //     // update the source column
  //     newTasks[sourceStatus] = sourceColumn;
  //     // add the task to the destination 
  //     const destColumn = [...newTasks[destinationSource]];
  //     destColumn.splice(destination?.index, 0, updatedMovedTask);
  //     newTasks[destinationSource] = destColumn;
  //     updatesPayload = [];
  //     updatesPayload.push({
  //       $id: updatedMovedTask.$id,
  //       status: destinationSource,
  //       position:Math.min((destination?.index+1) * 1000,1_000_000)
  //     })

  //     newTasks[destinationSource].forEach((task, index) => {
  //       if (task && task.$id !== updatedMovedTask.$id) {
  //         const newPosition = Math.min((index + 1), 1000, 1_000_000);
  //         if (task.position !== newPosition) {
  //           updatesPayload.push({
  //             $id: task.$id,
  //             status: destinationSource,
  //             position:newPosition
  //           })
  //         }
  //       }
  //     })

  //     if (sourceStatus !== destinationSource) {
  //       newTasks[sourceStatus].forEach((task, index) => {
  //         if (task) {
  //           const newPosition = Math.min((index + 1) * 1000, 1_000_00);
  //           if (task.position !== newPosition) {
  //             updatesPayload.push({
  //               $id: task.$id,
  //               status: sourceStatus,
  //               position: newPosition
  //             });
  //           }
  //         }
  //       })
  //     }
  //     return newTasks;
  //   })
  //   onChange(updatesPayload)
  // },[onChange])
  
  ///
  const onDrapEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;

      const sourceStatus = source.droppableId as TaskStatus;
      const destinationStatus = destination.droppableId as TaskStatus;

      let updatesPayload: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[] = [];

      setTasks((prevTask) => {
        const newTasks = { ...prevTask };

        // Remove from source
        const sourceColumn = [...newTasks[sourceStatus]];
        const [movedTask] = sourceColumn.splice(source.index, 1);

        if (!movedTask) {
          console.error("No task found at the source index");
          return prevTask;
        }

        // Update task status if changed
        const updatedMovedTask =
          sourceStatus !== destinationStatus
            ? { ...movedTask, status: destinationStatus }
            : movedTask;

        newTasks[sourceStatus] = sourceColumn;

        // Insert into destination
        const destColumn = [...newTasks[destinationStatus]];
        destColumn.splice(destination.index, 0, updatedMovedTask);
        newTasks[destinationStatus] = destColumn;

        // Recalculate positions in destination column
        destColumn.forEach((task, index) => {
          const newPosition = (index + 1) * 1000;
          if (task.position !== newPosition) {
            updatesPayload.push({
              $id: task.$id,
              status: destinationStatus,
              position: newPosition,
            });
          }
        });

        // Recalculate positions in source column if column changed
        if (sourceStatus !== destinationStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            const newPosition = (index + 1) * 1000;
            if (task.position !== newPosition) {
              updatesPayload.push({
                $id: task.$id,
                status: sourceStatus,
                position: newPosition,
              });
            }
          });
        }

        return newTasks;
      });

      onChange(updatesPayload);
    },
    [onChange]
  );

  ////
  return (
    <DragDropContext onDragEnd={onDrapEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
            >
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
              {/* BODY */}
              <Droppable droppableId={board}>
                {(provided) => (
                  <div {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px] py-1.5"
                  >
                    {tasks[board].map((task, index) => (
                      <Draggable key={task.$id}
                        draggableId={task.$id}
                        index={index}
                      >
                        {
                          (provided) => (
                            <div ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <KanbanCard task={task} />
                            </div>
                          )
                      }
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
