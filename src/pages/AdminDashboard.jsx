import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Trash2, Edit, PlusCircle, Briefcase, CheckSquare, Calendar, Clock } from 'lucide-react';
import '../index.css';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);

    // Modals state
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [editingEmpId, setEditingEmpId] = useState(null);
    const [empForm, setEmpForm] = useState({ name: '', email: '', password: '' });

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskEmpId, setTaskEmpId] = useState(null);
    const [taskTitle, setTaskTitle] = useState('');

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveEmpId, setLeaveEmpId] = useState(null);

    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [attendanceEmpId, setAttendanceEmpId] = useState(null);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        setEmployees(users.filter(u => u.role !== 'admin'));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Employee Management ---
    const openAddEmpModal = () => {
        setEmpForm({ name: '', email: '', password: '' });
        setEditingEmpId(null);
        setIsEmpModalOpen(true);
    };

    const openEditEmpModal = (emp) => {
        setEmpForm({ name: emp.name, email: emp.email, password: emp.password });
        setEditingEmpId(emp.id);
        setIsEmpModalOpen(true);
    };

    const saveEmployee = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (editingEmpId) {
            const index = users.findIndex(u => u.id === editingEmpId);
            if (index !== -1) {
                users[index] = { ...users[index], ...empForm };
            }
        } else {
            if (users.find(u => u.email === empForm.email)) {
                alert("Email already exists");
                return;
            }
            users.push({
                id: Date.now(),
                name: empForm.name,
                email: empForm.email,
                password: empForm.password,
                role: 'employee',
                casualLeave: 12,
                sickLeave: 5,
                tasks: [],
                leaves: [],
                attendance: []
            });
        }
        localStorage.setItem('users', JSON.stringify(users));
        loadEmployees();
        setIsEmpModalOpen(false);
    };

    const deleteEmployee = (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(u => u.id !== id);
            localStorage.setItem('users', JSON.stringify(users));
            loadEmployees();
        }
    };

    // --- Task Management ---
    const openTaskModal = (empId) => {
        setTaskEmpId(empId);
        setIsTaskModalOpen(true);
    };

    const addTaskToEmployee = (e) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const emp = users.find(u => u.id === taskEmpId);
        if (emp) {
            if (!emp.tasks) emp.tasks = [];
            emp.tasks.push({
                id: Date.now(),
                title: taskTitle,
                status: 'Pending',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));
            loadEmployees();
            setTaskTitle('');
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

    // --- Leave Management ---
    const openLeaveModal = (empId) => {
        setLeaveEmpId(empId);
        setIsLeaveModalOpen(true);
    };

    const handleLeaveStatus = (empId, leaveId, newStatus, leaveType) => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const emp = users.find(u => u.id === empId);
        if (emp && emp.leaves) {
            const leave = emp.leaves.find(l => l.id === leaveId);
            if (leave) {
                leave.status = newStatus;
                if (newStatus === 'Approved') {
                    if (leaveType === 'Casual Leave') emp.casualLeave = Math.max(0, emp.casualLeave - 1);
                    if (leaveType === 'Sick Leave') emp.sickLeave = Math.max(0, emp.sickLeave - 1);
                }
                localStorage.setItem('users', JSON.stringify(users));
                loadEmployees();
            }
        }
    };

    // --- Attendance Management ---
    const openAttendanceModal = (empId) => {
        setAttendanceEmpId(empId);
        setIsAttendanceModalOpen(true);
    };

    if (!user || user.role !== 'admin') return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Access Denied</div>;

    const currentTaskEmp = employees.find(e => e.id === taskEmpId);
    const currentLeaveEmp = employees.find(e => e.id === leaveEmpId);
    const currentAttendanceEmp = employees.find(e => e.id === attendanceEmpId);

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <header className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', marginBottom: '2rem' }}>
                <div className="flex-center">
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}>
                        <Briefcase size={24} color="#4facfe" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Admin Portal</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>Manage Employees</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={handleLogout} style={{ background: 'rgba(255, 100, 100, 0.2)', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <div className="glass-card" style={{ padding: '2rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="flex-center">
                        <Users size={24} color="#4facfe" />
                        <h2 style={{ margin: 0 }}>Employee Directory</h2>
                    </div>
                    <button className="btn-primary" onClick={openAddEmpModal} style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={16} /> Add Employee
                    </button>
                </div>

                {employees.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No employees found. Wait for registrations.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Name</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Email</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Management</th>
                                    <th style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>{emp.name}</td>
                                        <td style={{ padding: '1rem', color: '#aaa' }}>{emp.email}</td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button onClick={() => openTaskModal(emp.id)} style={{ background: 'rgba(79, 172, 254, 0.1)', border: '1px solid rgba(79, 172, 254, 0.2)', color: '#4facfe', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }} title="Tasks">
                                                <CheckSquare size={14} /> Tasks
                                            </button>
                                            <button onClick={() => openLeaveModal(emp.id)} style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.2)', color: '#ff9800', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', position: 'relative' }} title="Leaves">
                                                <Calendar size={14} /> Leaves
                                                {emp.leaves && emp.leaves.filter(l => l.status === 'Pending').length > 0 &&
                                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff9800', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                                        {emp.leaves.filter(l => l.status === 'Pending').length}
                                                    </span>
                                                }
                                            </button>
                                            <button onClick={() => openAttendanceModal(emp.id)} style={{ background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)', color: '#4caf50', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }} title="Attendance">
                                                <Clock size={14} /> Attendance
                                            </button>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => openEditEmpModal(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4facfe' }}><Edit size={18} /></button>
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b' }} onClick={() => deleteEmployee(emp.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Employee Modal (Add/Edit) */}
            {isEmpModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ marginTop: 0 }}>{editingEmpId ? 'Edit Employee' : 'Add Employee'}</h3>
                        <form onSubmit={saveEmployee}>
                            <input type="text" placeholder="Name" className="input-field" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} required />
                            <input type="email" placeholder="Email" className="input-field" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} required />
                            <input type="password" placeholder="Password" className="input-field" value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} required={!editingEmpId} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                                <button type="button" onClick={() => setIsEmpModalOpen(false)} className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {isTaskModalOpen && currentTaskEmp && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '500px', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Tasks for {currentTaskEmp.name}</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <form onSubmit={addTaskToEmployee} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <input type="text" placeholder="New Task Title" className="input-field" style={{ margin: 0 }} value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                            <button type="submit" className="btn-primary">Add</button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {(!currentTaskEmp.tasks || currentTaskEmp.tasks.length === 0) ? (
                                <p style={{ color: '#aaa', textAlign: 'center' }}>No tasks assigned.</p>
                            ) : (
                                Object.entries(groupTasksByDate(currentTaskEmp.tasks)).map(([dateLabel, tasksInGroup]) => (
                                    <div key={dateLabel}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#4facfe', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>{dateLabel}</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {tasksInGroup.map(task => (
                                                <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                                    <span>{task.title}</span>
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
                </div>
            )}

            {/* Leave Modal */}
            {isLeaveModalOpen && currentLeaveEmp && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '600px', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Leave Requests - {currentLeaveEmp.name}</h3>
                            <button onClick={() => setIsLeaveModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {(currentLeaveEmp.leaves || []).length === 0 ? (
                            <p style={{ color: '#aaa', textAlign: 'center' }}>No leave requests found.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {currentLeaveEmp.leaves.slice().reverse().map(leave => (
                                    <li key={leave.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <div>
                                                <strong style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                    {leave.type}
                                                </strong>
                                                <span style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginTop: '4px' }}>Date requested: {leave.date}</span>
                                            </div>
                                            <span style={{
                                                color: leave.status === 'Approved' ? '#4caf50' : leave.status === 'Rejected' ? '#ff6b6b' : '#ff9800',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)',
                                                height: 'fit-content'
                                            }}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        {leave.reason && (
                                            <p style={{ color: '#ddd', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
                                                "{leave.reason}"
                                            </p>
                                        )}

                                        {leave.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <button onClick={() => handleLeaveStatus(currentLeaveEmp.id, leave.id, 'Approved', leave.type)} className="btn-primary" style={{ flex: 1, background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}>Approve Leave</button>
                                                <button onClick={() => handleLeaveStatus(currentLeaveEmp.id, leave.id, 'Rejected', leave.type)} className="btn-primary" style={{ flex: 1, background: 'rgba(255, 107, 107, 0.2)', color: '#ff6b6b' }}>Reject Leave</button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Attendance Modal */}
            {isAttendanceModalOpen && currentAttendanceEmp && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '500px', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Attendance Log - {currentAttendanceEmp.name}</h3>
                            <button onClick={() => setIsAttendanceModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {(currentAttendanceEmp.attendance || []).length === 0 ? (
                            <p style={{ color: '#aaa', textAlign: 'center' }}>No attendance records found.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <th style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date</th>
                                            <th style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Clock In Time</th>
                                            <th style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Clock Out Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentAttendanceEmp.attendance.slice().reverse().map((att, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '10px' }}>{att.date}</td>
                                                <td style={{ padding: '10px', color: '#4caf50' }}>{att.clockIn}</td>
                                                <td style={{ padding: '10px', color: '#ff6b6b' }}>{att.clockOut || '---'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
