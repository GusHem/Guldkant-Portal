import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { formatTimestamp } from '../../utils/helpers';

const EventLog = ({ events }) => {
    const { classes } = useContext(ThemeContext);
    if (!events || events.length === 0) {
        return <p className={`${classes.textSecondary} text-sm`}>Inga händelser loggade.</p>;
    }
    return (
        <div className="space-y-2">
            {events.slice().reverse().map((event, index) => (
                <div key={index} className="text-sm">
                    <span className={`font-semibold ${classes.textSecondary}`}>{formatTimestamp(event.timestamp)}:</span>
                    <span className="ml-2">{event.event}</span>
                </div>
            ))}
        </div>
    );
};

export default EventLog;