import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Todo = ({ todo, updateTodo, deleteTodo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [task, setTask] = useState(todo.task);

  const handleUpdate = () => {
    updateTodo(todo._id, { ...todo, task });
    setIsEditing(false);
  };

  const toggleComplete = () => {
    updateTodo(todo._id, { ...todo, completed: !todo.completed });
  };

  const displayTask = () => {
    let taskText = todo.task;
    if (todo.user && typeof todo.user === 'object' && todo.user.username) {
      taskText += ` (by ${todo.user.username})`;
    }
    return taskText;
  };

  return (
    <motion.div
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {isEditing ? (
        <motion.input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="edit-input"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      ) : (
        <motion.span
          className="todo-task"
          onClick={toggleComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {displayTask()}
        </motion.span>
      )}
      <div className="todo-actions">
        {isEditing ? (
          <motion.button
            onClick={handleUpdate}
            className="save-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save
          </motion.button>
        ) : (
          <motion.button
            onClick={() => setIsEditing(true)}
            className="edit-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Edit
          </motion.button>
        )}
        <motion.button
          onClick={() => deleteTodo(todo._id)}
          className="delete-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Todo;