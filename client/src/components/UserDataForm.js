import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const UserDataForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    phoneNumber: '',
    address: '',
    identificationNumber: '',
    employments: [],
    incomes: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmploymentChange = (index, e) => {
    const updatedEmployments = formData.employments.map((emp, i) => {
      if (i === index) {
        return { ...emp, [e.target.name]: e.target.value };
      }
      return emp;
    });
    setFormData({ ...formData, employments: updatedEmployments });
  };

  const addEmployment = () => {
    setFormData({
      ...formData,
      employments: [...formData.employments, { year: '', status: 'employed', employer: '', employmentType: '', company: '', businessType: '', unemployedSince: '', designation: '', income: '' }],
    });
  };

  const removeEmployment = (index) => {
    const updatedEmployments = formData.employments.filter((_, i) => i !== index);
    setFormData({ ...formData, employments: updatedEmployments });
  };

  const handleIncomeChange = (index, e) => {
    const updatedIncomes = formData.incomes.map((inc, i) => {
      if (i === index) {
        return { ...inc, [e.target.name]: e.target.value };
      }
      return inc;
    });
    setFormData({ ...formData, incomes: updatedIncomes });
  };

  const addIncome = () => {
    setFormData({
      ...formData,
      incomes: [...formData.incomes, { category: 'employee', amount: '' }],
    });
  };

  const removeIncome = (index) => {
    const updatedIncomes = formData.incomes.filter((_, i) => i !== index);
    setFormData({ ...formData, incomes: updatedIncomes });
  };

  const handleSubmitLocal = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.form
      onSubmit={handleSubmitLocal}
      className="user-data-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>{initialData ? 'Edit User Data' : 'Add User Data'}</h2>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />
      <input
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        placeholder="Age"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="text"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
        required
      />
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        required
      />
      <input
        type="text"
        name="identificationNumber"
        value={formData.identificationNumber}
        onChange={handleChange}
        placeholder="Identification Number"
        required
      />
      <h3>Employments</h3>
      {formData.employments.map((emp, index) => (
        <div key={index} className="employment-section">
          <input
            type="number"
            name="year"
            value={emp.year}
            onChange={(e) => handleEmploymentChange(index, e)}
            placeholder="Year"
            required
          />
          <select
            name="status"
            value={emp.status}
            onChange={(e) => handleEmploymentChange(index, e)}
            required
          >
            <option value="employed">Employed</option>
            <option value="self-employed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
          </select>
          {emp.status === 'employed' && (
            <>
              <input
                type="text"
                name="employer"
                value={emp.employer}
                onChange={(e) => handleEmploymentChange(index, e)}
                placeholder="Employer"
              />
              <input
                type="text"
                name="employmentType"
                value={emp.employmentType}
                onChange={(e) => handleEmploymentChange(index, e)}
                placeholder="Employment Type"
              />
            </>
          )}
          {emp.status === 'self-employed' && (
            <>
              <input
                type="text"
                name="company"
                value={emp.company}
                onChange={(e) => handleEmploymentChange(index, e)}
                placeholder="Company"
              />
              <input
                type="text"
                name="businessType"
                value={emp.businessType}
                onChange={(e) => handleEmploymentChange(index, e)}
                placeholder="Business Type"
              />
            </>
          )}
          {emp.status === 'unemployed' && (
            <input
              type="date"
              name="unemployedSince"
              value={emp.unemployedSince ? new Date(emp.unemployedSince).toISOString().split('T')[0] : ''}
              onChange={(e) => handleEmploymentChange(index, e)}
              placeholder="Unemployed Since"
            />
          )}
          <input
            type="text"
            name="designation"
            value={emp.designation}
            onChange={(e) => handleEmploymentChange(index, e)}
            placeholder="Designation"
          />
          <input
            type="number"
            name="income"
            value={emp.income}
            onChange={(e) => handleEmploymentChange(index, e)}
            placeholder="Income"
          />
          <button type="button" onClick={() => removeEmployment(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addEmployment}>Add Employment</button>
      <h3>Incomes</h3>
      {formData.incomes.map((inc, index) => (
        <div key={index} className="income-section">
          <select
            name="category"
            value={inc.category}
            onChange={(e) => handleIncomeChange(index, e)}
            required
          >
            <option value="employee">Employee</option>
            <option value="self-employed">Self-Employed</option>
          </select>
          <input
            type="number"
            name="amount"
            value={inc.amount}
            onChange={(e) => handleIncomeChange(index, e)}
            placeholder="Amount"
            required
          />
          <button type="button" onClick={() => removeIncome(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addIncome}>Add Income</button>
      <div className="form-actions">
        <motion.button
          type="submit"
          className="auth-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {initialData ? 'Update' : 'Add'}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          className="cancel-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
      </div>
    </motion.form>
  );
};

export default UserDataForm;