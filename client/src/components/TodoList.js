import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Todo from './Todo';

const TodoList = ({ todos, updateTodo, deleteTodo }) => {
  return (
    <div className="todo-list">
      {todos.length === 0 ? (
        <p className="no-todos">No todos yet. Add one!</p>
      ) : (
        <AnimatePresence>
          {todos.map((todo) => (
            <Todo
              key={todo._id}
              todo={todo}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default TodoList;