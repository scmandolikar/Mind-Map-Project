import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

// Context hooks are intentionally exported alongside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [savedMaps, setSavedMaps] = useState([]);
    const [logs, setLogs] = useState([]);

    // Load data from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('mindmap_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        const storedHistory = localStorage.getItem('mindmap_history');
        if (storedHistory) setHistory(JSON.parse(storedHistory));

        const storedSaved = localStorage.getItem('mindmap_saved');
        if (storedSaved) setSavedMaps(JSON.parse(storedSaved));

        const storedLogs = localStorage.getItem('mindmap_logs');
        if (storedLogs) setLogs(JSON.parse(storedLogs));
    }, []);

    const login = (username) => {
        const newUser = { username, joinedAt: new Date().toISOString() };
        setUser(newUser);
        localStorage.setItem('mindmap_user', JSON.stringify(newUser));
        logAction(`User logged in: ${username}`);
    };

    const logout = () => {
        logAction(`User logged out: ${user?.username}`);
        setUser(null);
        localStorage.removeItem('mindmap_user');
    };

    const addToHistory = useCallback((mapId) => {
        setHistory((prev) => {
            const newHistory = [mapId, ...prev.filter((id) => id !== mapId)].slice(0, 10);
            localStorage.setItem('mindmap_history', JSON.stringify(newHistory));
            return newHistory;
        });
        // Only log if it's a new visit to avoid spam
        // logAction(`Visited map: ${mapId}`); 
    }, []);

    const saveMap = (mapId) => {
        setSavedMaps((prev) => {
            if (prev.includes(mapId)) return prev;
            const newSaved = [...prev, mapId];
            localStorage.setItem('mindmap_saved', JSON.stringify(newSaved));
            logAction(`Saved map: ${mapId}`);
            return newSaved;
        });
    };

    const removeSavedMap = (mapId) => {
        setSavedMaps((prev) => {
            const newSaved = prev.filter(id => id !== mapId);
            localStorage.setItem('mindmap_saved', JSON.stringify(newSaved));
            logAction(`Removed saved map: ${mapId}`);
            return newSaved;
        });
    };

    const logAction = (action) => {
        const newLog = { action, timestamp: new Date().toISOString() };
        setLogs((prev) => {
            const newLogs = [newLog, ...prev].slice(0, 50); // Keep last 50 logs
            localStorage.setItem('mindmap_logs', JSON.stringify(newLogs));
            return newLogs;
        });
    };

    return (
        <UserContext.Provider value={{ user, login, logout, history, addToHistory, savedMaps, saveMap, removeSavedMap, logs }}>
            {children}
        </UserContext.Provider>
    );
};
