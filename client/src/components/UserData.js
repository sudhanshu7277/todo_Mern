import React from 'react';
import { motion } from 'framer-motion';

const UserData = ({ data, updateUserData, deleteUserData }) => {
  return (
    <motion.div
      className="user-data-item"
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="user-data-details">
        <h3>{data.firstName} {data.lastName}</h3>
        <p>Age: {data.age}</p>
        <p>Email: {data.email}</p>
        <p>Phone: {data.phoneNumber}</p>
        <p>Address: {data.address}</p>
        <p>ID: {data.identificationNumber}</p>
        <h4>Employments:</h4>
        <ul>
          {data.employments.map((emp, index) => (
            <li key={index}>
              Year: {emp.year}, Status: {emp.status}
              {emp.status === 'employed' && <span>, Employer: {emp.employer}, Type: {emp.employmentType}</span>}
              {emp.status === 'self-employed' && <span>, Company: {emp.company}, Type: {emp.businessType}</span>}
              {emp.status === 'unemployed' && <span>, Since: {new Date(emp.unemployedSince).toLocaleDateString()}</span>}
              , Designation: {emp.designation}, Income: {emp.income}
            </li>
          ))}
        </ul>
        <h4>Incomes:</h4>
        <ul>
          {data.incomes.map((inc, index) => (
            <li key={index}>
              Category: {inc.category}, Amount: {inc.amount}
            </li>
          ))}
        </ul>
        <p>Total Income: {data.totalIncome}</p>
      </div>
      <div className="user-data-actions">
        <motion.button
          onClick={() => updateUserData(data)}
          className="edit-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Edit
        </motion.button>
        <motion.button
          onClick={() => deleteUserData(data._id)}
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

export default UserData;