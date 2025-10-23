'use client';

import { useState, useEffect } from 'react';
import './globals.css';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function Page() {
  const [fileNr, setFileNr] = useState('');
  const [visitType, setVisitType] = useState('Dr review');
  const [interval, setInterval] = useState(3);
  const [unit, setUnit] = useState('months');
  const [bookings, setBookings] = useState<Record<string, any[]>>({});
  const [doctorStatus, setDoctorStatus] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'normal' | 'leave' | 'oncall'>('normal');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ fileNr: string; date: string } | null>(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Load data from Redis
  useEffect(() => {
    async function fetchData() {
      const [bRes, sRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/doctorStatus'),
      ]);
      const bData = await bRes.json();
      const sData = await sRes.json();
      setBookings(bData.value || {});
      setDoctorStatus(sData.value || {});
    }
    fetchData();
  }, []);

  async function saveBookingsToCloud(newBookings: Record<string, any[]>) {
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newBookings }),
    });
  }

  async function saveDoctorStatusToCloud(newStatus: Record<string, string>) {
    await fetch('/api/doctorStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newStatus }),
    });
  }

  function changeMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  function isoFromParts(y: number, m: number, d: number) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
  }

  function bookingsForIso(iso: string) {
    return bookings[iso] || [];
  }

  function toggleSelectDate(year: number, monthIndex: number, day: number) {
    const iso = isoFromParts(year, monthIndex, day);
    if (mode === 'normal') setSelectedDate(iso);
    else toggleDoctorStatus(day);
  }

  function handleNextVisit() {
    if (!fileNr) return alert('Enter a file number first.');
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    if (unit === 'weeks') base.setDate(base.getDate() + interval * 7);
    else base.setMonth(base.getMonth() + interval);
    const iso = base.toISOString().split('T')[0];
    setSelectedDate(iso);
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
  }

  function bookDate() {
    if (!fileNr) return alert('Enter a 5-digit file number.');
    if (!/^\d{1,5}$/.test(fileNr))
      return alert('File number must be digits (max 5).');
    if (!selectedDate) return alert('Select a date first.');

    setBookings((prev) => {
      const copy = { ...prev };
      const arr = copy[selectedDate] ? [...copy[selectedDate]] : [];
      if (arr.length >= 20) {
        if (!confirm('Already 20+ patients. Continue?')) return prev;
      }
      arr.push({ fileNr, visitType });
      copy[selectedDate] = arr;

      saveBookingsToCloud(copy);
      return copy;
    });

    setConfirmation({ fileNr, date: selectedDate });
    setFileNr('');
  }

  function toggleDoctorStatus(day: number) {
    const key = `${viewYear}-${viewMonth}-${day}`;
    setDoctorStatus((prev) => {
      const copy = { ...prev };
      const cur = copy[key];

      if (mode === 'leave') {
        if (cur === 'leave') delete copy[key];
        else copy[key] = 'leave';
      } else if (mode === 'oncall') {
        if (cur === 'oncall') delete copy[key];
        else copy[key] = 'oncall';
      }

      saveDoctorStatusToCloud(copy);
      return copy;
    });
  }

  function renderCalendar() {
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      const row = cells.slice(i, i + 7).map((cell, idx) => {
        if (!cell) return <div key={`${i}-${idx}`} className="empty"></div>;
        const d = cell.getDate();
        const iso = isoFromParts(viewYear, viewMonth, d);
        const count = bookingsForIso(iso).length;
        const statusKey = `${viewYear}-${viewMonth}-${d}`;
        const status = doctorStatus[statusKey];
        const warn = count >= 20 || !!status;
        const selected = selectedDate === iso;

        return (
          <div
            key={iso}
            className={`day${warn ? ' red' : ''}${selected ? ' selected' : ''}`}
            onClick={() => toggleSelectDate(viewYear, viewMonth, d)}
          >
            <div className="day-top">
              <div className="day-num">{d}</div>
              <div className="day-count">{count}</div>
            </div>
            <div className="day-bottom">
              {status === 'leave' && <span className="tag leave">On Leave</span>}
              {status === 'oncall' && <span className="tag oncall">On Call</span>}
            </div>
          </div>
        );
      });
      weeks.push(
        <div className="week" key={'w' + i}>
          {row}
        </div>
      );
    }
    return weeks;
  }

  function clearBooking() {
    if (!fileNr) return alert('Enter a file number to clear.');
    if (!selectedDate) return alert('Select a date first.');

    setBookings((prev) => {
      const copy = { ...prev };
      const arr = copy[selectedDate] ? [...copy[selectedDate]] : [];
      const newArr = arr.filter((b) => b.fileNr !== fileNr);

      if (arr.length === newArr.length) {
        alert(`No booking found for file ${fileNr} on ${selectedDate}.`);
        return prev;
      }

      copy[selectedDate] = newArr;
      saveBookingsToCloud(copy);
      alert(`Booking for file ${fileNr} on ${selectedDate} cleared.`);
      return copy;
    });

    setFileNr('');
  }


  return (
    <div className="container">
      <header>
        <h2>Clinic Booking (Upstash Redis)</h2>
        <div className="toolbar">
          <button
            className={mode === 'leave' ? 'active' : ''}
            onClick={() => setMode((m) => (m === 'leave' ? 'normal' : 'leave'))}
          >
            {mode === 'leave' ? 'Done (Leave)' : 'Mark On Leave'}
          </button>
          <button
            className={mode === 'oncall' ? 'active' : ''}
            onClick={() => setMode((m) => (m === 'oncall' ? 'normal' : 'oncall'))}
          >
            {mode === 'oncall' ? 'Done (On Call)' : 'Mark On Call'}
          </button>
        </div>
      </header>

      <div className="form">
        <label>File number (5 digits):</label>
        <input
          value={fileNr}
          maxLength={5}
          onChange={(e) => setFileNr(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 01234"
        />

        <label>Visit type:</label>
        <select value={visitType} onChange={(e) => setVisitType(e.target.value)}>
          <option>Dr review</option>
          <option>Sr review</option>
          <option>Pills only</option>
        </select>

        <label>Next visit:</label>
        <div className="next-visit">
          <input
            type="number"
            min="1"
            max="6"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
          />
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="weeks">weeks</option>
            <option value="months">months</option>
          </select>
          <button onClick={handleNextVisit}>Show date</button>
        </div>
      </div>

      <div className="calendar">
        <div className="month-header">
          <button onClick={() => changeMonth(-1)}>&lt;</button>
          <div className="month-title">
            {new Date(viewYear, viewMonth).toLocaleString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <button onClick={() => changeMonth(1)}>&gt;</button>
        </div>

        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid-wrap">{renderCalendar()}</div>
      </div>

      <div className="actions">
        <button className="book-btn" onClick={bookDate}>
          Book
        </button>
        <button className="clear-btn" onClick={clearBooking}>
          Clear Booking
        </button>
      </div>

      {confirmation && (
        <div className="confirm">
          ✅ Booking confirmed for file <strong>{confirmation.fileNr}</strong> on{' '}
          <strong>{confirmation.date}</strong>
        </div>
      )}
    </div>
  );
}
