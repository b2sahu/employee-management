import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, CheckSquare, Clock } from 'lucide-react';
import '../index.css';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [employeeData, setEmployeeData] = useState(null);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveForm, setLeaveForm] = useState({ type: 'Casual Leave', reason: '' });

    useEffect(() => {
        if (user) {
            loadEmployeeData();
        }
    }, [user]);

    const loadEmployeeData = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUserData = users.find(u => u.id === user.id);
        if (currentUserData) setEmployeeData(currentUserData);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleTaskComplete = (taskId) => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUserData = users.find(u => u.id === user.id);
        if (currentUserData) {
            const task = currentUserData.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
                localStorage.setItem('users', JSON.stringify(users));
                loadEmployeeData();
            }
        }
    };

    const submitLeaveRequest = (e) => {
        e.preventDefault();
        const date = new Date().toLocaleDateString();
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUserData = users.find(u => u.id === user.id);

        if (currentUserData) {
            if (!currentUserData.leaves) currentUserData.leaves = [];
            currentUserData.leaves.push({
                id: Date.now(),
                type: leaveForm.type,
                reason: leaveForm.reason,
                date: date,
                status: 'Pending'
            });
            localStorage.setItem('users', JSON.stringify(users));
            setIsLeaveModalOpen(false);
            setLeaveForm({ type: 'Casual Leave', reason: '' });
            loadEmployeeData();
        }
    };

    const handleClockIn = () => {
        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUserData = users.find(u => u.id === user.id);
        if (currentUserData) {
            if (!currentUserData.attendance) currentUserData.attendance = [];
            currentUserData.attendance.push({
                date,
                clockIn: time,
                clockOut: null
            });
            localStorage.setItem('users', JSON.stringify(users));
            loadEmployeeData();
        }
    };

    const handleClockOut = () => {
        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUserData = users.find(u => u.id === user.id);
        if (currentUserData) {
            const todayRecord = currentUserData.attendance.find(a => a.date === date && !a.clockOut);
            if (todayRecord) {
                todayRecord.clockOut = time;
                localStorage.setItem('users', JSON.stringify(users));
                loadEmployeeData();
            }
        }
    };

    const groupTasksByDate = (tasks) => {
        const groups = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedTasks = [...tasks].sort((a, b) => b.id - a.id);

        sortedTasks.forEach(task => {
            const taskDate = new Date(task.timestamp || task.id);
            taskDate.setHours(0, 0, 0, 0);

            const diffTime = today - taskDate;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            let label = taskDate.toLocaleDateString();
            if (diffDays === 0) label = "Today's Tasks";
            else if (diffDays === 1) label = "Yesterday's Tasks";
            else if (diffDays < 0) label = "Today's Tasks";

            if (!groups[label]) groups[label] = [];
            groups[label].push(task);
        });
        return groups;
    };

    if (!user) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    const myTasks = employeeData?.tasks || [];
    const myLeaves = employeeData?.leaves || [];
    const myAttendance = employeeData?.attendance || [];

    const today = new Date().toLocaleDateString();
    const todayAttendance = myAttendance.find(a => a.date === today && !a.clockOut) || myAttendance.find(a => a.date === today);

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <header className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', marginBottom: '2rem' }}>
                <div className="flex-center">
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
                        <User size={24} color="#4facfe" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa', textTransform: 'capitalize' }}>{user.role}</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={handleLogout} style={{ background: 'rgba(255, 100, 100, 0.2)', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
                <div className="glass-card" style={{ textAlign: 'left', gridColumn: '1 / -1' }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                        <Clock size={24} color="#4facfe" />
                        <h2 style={{ margin: 0 }}>Attendance System</h2>
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
                        <div>
                            <p style={{ margin: 0, color: '#aaa' }}>Date: <strong style={{ color: '#fff' }}>{today}</strong></p>
                            {todayAttendance ? (
                                <p style={{ margin: '5px 0 0', color: '#aaa' }}>
                                    Clock In: <strong style={{ color: '#4caf50' }}>{todayAttendance.clockIn}</strong>
                                    {todayAttendance.clockOut && <span> | Clock Out: <strong style={{ color: '#ff6b6b' }}>{todayAttendance.clockOut}</strong></span>}
                                </p>
                            ) : (
                                <p style={{ margin: '5px 0 0', color: '#aaa' }}>You haven't clocked in today.</p>
                            )}
                        </div>
                        <div>
                            {!todayAttendance || (todayAttendance && todayAttendance.clockOut) ? (
                                <button className="btn-primary" onClick={handleClockIn} style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}>Clock In</button>
                            ) : (
                                <button className="btn-primary" onClick={handleClockOut} style={{ background: 'rgba(255, 107, 107, 0.2)', color: '#ff6b6b' }}>Clock Out</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ textAlign: 'left' }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                        <CheckSquare size={24} color="#4facfe" />
                        <h2 style={{ margin: 0 }}>My Tasks</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myTasks.length === 0 ? (
                            <p style={{ color: '#aaa' }}>No tasks assigned by Admin yet.</p>
                        ) : (
                            Object.entries(groupTasksByDate(myTasks)).map(([dateLabel, tasksInGroup]) => (
                                <div key={dateLabel}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#4facfe', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>{dateLabel}</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {tasksInGroup.map(task => (
                                            <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? '#aaa' : '#fff' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'Completed'}
                                                        onChange={() => toggleTaskComplete(task.id)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                    {task.title}
                                                </label>
                                                <span style={{
                                                    color: task.status === 'Completed' ? '#4caf50' : '#ff9800',
                                                    fontSize: '0.8rem',
                                                    background: task.status === 'Completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px'
                                                }}>
                                                    {task.status}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ textAlign: 'left' }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                        <Calendar size={24} color="#4facfe" />
                        <h2 style={{ margin: 0 }}>Leave Management</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-around', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '2rem', color: '#4facfe' }}>{employeeData?.casualLeave ?? 12}</h3>
                            <p style={{ margin: '5px 0 0', color: '#aaa', fontSize: '0.9rem' }}>Casual Leave</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '2rem', color: '#ff9800' }}>{employeeData?.sickLeave ?? 5}</h3>
                            <p style={{ margin: '5px 0 0', color: '#aaa', fontSize: '0.9rem' }}>Sick Leave</p>
                        </div>
                    </div>

                    <button onClick={() => setIsLeaveModalOpen(true)} className="btn-primary" style={{ marginTop: '2rem', width: '100%', fontSize: '0.9rem' }}>Apply for Leave</button>

                    {myLeaves.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ marginBottom: '10px' }}>Recent Leaves</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {myLeaves.slice().reverse().map(leave => (
                                    <li key={leave.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', marginBottom: '5px' }}>
                                            <span style={{ color: '#fff' }}>{leave.date}</span>
                                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{leave.type}</span>
                                            <span style={{
                                                marginLeft: 'auto',
                                                color: leave.status === 'Approved' ? '#4caf50' : leave.status === 'Rejected' ? '#ff6b6b' : '#ff9800',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold'
                                            }}>{leave.status}</span>
                                        </div>
                                        {leave.reason && <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', width: '100%' }}>Reason: {leave.reason}</p>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Leave Modal */}
            {isLeaveModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ marginTop: 0 }}>Apply for Leave</h3>
                        <form onSubmit={submitLeaveRequest}>
                            <select
                                className="input-field"
                                value={leaveForm.type}
                                onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <option style={{ color: 'black' }} value="Casual Leave">Casual Leave</option>
                                <option style={{ color: 'black' }} value="Sick Leave">Sick Leave</option>
                            </select>
                            <textarea
                                placeholder="Reason for leave"
                                className="input-field"
                                value={leaveForm.reason}
                                onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                required
                                rows="4"
                                style={{ resize: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Request</button>
                                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
