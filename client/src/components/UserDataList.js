import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import UserData from './UserData';

const UserDataList = ({ userDataList, updateUserData, deleteUserData, isAllView }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/userdata/export${isAllView ? '?all=true' : ''}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user-data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to export CSV.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error('Error exporting CSV.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="user-data-list">
      <motion.button
        onClick={handleExportCSV}
        className="export-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Export to CSV
      </motion.button>
      {userDataList.length === 0 ? (
        <p className="no-data">No user data yet. Add one!</p>
      ) : (
        <AnimatePresence>
          {userDataList.map((data) => (
            <UserData
              key={data._id}
              data={data}
              updateUserData={updateUserData}
              deleteUserData={deleteUserData}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default UserDataList;