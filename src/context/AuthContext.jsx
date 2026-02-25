import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize default admin if not exists
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        if (!storedUsers.find(u => u.email === 'admin@example.com')) {
            storedUsers.push({
                id: Date.now(),
                name: 'Administrator',
                email: 'admin@example.com',
                password: 'admin',
                role: 'admin'
            });
            localStorage.setItem('users', JSON.stringify(storedUsers));
        }

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const foundUser = storedUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            return foundUser;
        } else {
            throw 'Invalid email or password';
        }
    };

    const register = async (name, email, password) => {
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        if (storedUsers.find(u => u.email === email)) {
            throw 'Email already exists';
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: 'employee',
            casualLeave: 12,
            sickLeave: 5,
            tasks: [],
            leaves: [],
            attendance: []
        };

        storedUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
