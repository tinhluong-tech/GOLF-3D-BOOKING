import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

const BAYS = Array.from({ length: 7 }, (_, i) => `Bay ${i + 1}`)
const HOURS = Array.from({ length: 8 }, (_, i) => i + 9)
const DAYS_MAP = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' }

function getWeekDates() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const label = DAYS_MAP[d.getDay()]
    const dateStr = d.toISOString().split('T')[0]
    const shortDate = `${d.getDate()}/${d.getMonth() + 1}`
    days.push({ label, dateStr, shortDate, isToday: d.toDateString() === today.toDateString() })
  }
  return days
}

// ─── Styles ───
const S = {
  page: { minHeight: '100vh', background: '#f8f6f1', color: '#1a2e1a', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  header: { background: 'linear-gradient(135deg, #1a3c2a 0%, #0d1f15 100%)', padding: '24px 20px 20px', color: '#fff' },
  container: { maxWidth: 900, margin: '0 auto', padding: '0 16px' },
  tabBtn: (active) => ({
    flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg, #1a3c2a, #16a34a)' : '#efe9de',
    color: active ? '#fff' : '#7a7060',
  }),
  dayBtn: (active, isToday) => ({
    flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
    background: active ? '#1a3c2a' : isToday ? '#e8f5e9' : '#efe9de',
    color: active ? '#fff' : isToday ? '#16a34a' : '#8a8070', transition: 'all 0.2s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  }),
  bayCard: (active) => ({
    padding: 14, borderRadius: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    transition: 'all 0.2s', border: active ? '2px solid #16a34a' : '2px solid #e5e0d5',
    background: active ? '#e8f5e9' : '#fff',
  }),
  card: { background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e0d5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  greenBtn: { padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' },
  input: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e0d5', background: '#fafaf7', color: '#1a2e1a', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  mono: { fontFamily: "'JetBrains Mono', monospace" },
}

// ─── Toast ───
function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
      background: toast.type === 'error' ? '#b91c1c' : '#15803d', color: '#fff',
      padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)', animation: 'slideDown 0.3s ease',
    }}>{toast.msg}</div>
  )
}

// ─── Loading ───
function Loader({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
      <div style={{ fontSize: 28, marginBottom: 8, animation: 'pulse 1.5s infinite' }}>⛳</div>
      <div style={{ fontSize: 13 }}>{text || 'Đang tải...'}</div>
    </div>
  )
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState('booking')
  const [toast, setToast] = useState(null)

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t) } }, [toast])
  const showToast = (msg, type = 'success') => setToast({ msg, type })

  return (
    <div style={S.page}>
      <Toast toast={toast} />

      {/* Header */}
      <div style={S.header}>
        <div style={S.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>⛳</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "'DM Serif Display', serif", letterSpacing: 0.5 }}>GOLF 3D CLUB</h1>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', ...S.mono, letterSpacing: 3 }}>MEMBER BOOKING</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.container}>
        <div style={{ display: 'flex', gap: 6, padding: '16px 0', borderBottom: '1px solid #e5e0d5' }}>
          {[
            { id: 'booking', label: '📅 Book Bay' },
            { id: 'videos', label: '🎬 Video Swing' },
            { id: 'outings', label: '⛳ Outing' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={S.tabBtn(tab === t.id)}>{t.label}</button>
          ))}
        </div>

        {tab === 'booking' && <BookingTab showToast={showToast} />}
        {tab === 'videos' && <VideosTab />}
        {tab === 'outings' && <OutingsTab showToast={showToast} />}
      </div>

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════
// BOOKING TAB
// ═══════════════════════════════════════
function BookingTab({ showToast }) {
  const weekDates = getWeekDates()
  const [selectedDay, setSelectedDay] = useState(() => weekDates.find(d => d.isToday)?.dateStr || weekDates[0].dateStr)
  const [selectedBay, setSelectedBay] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [bookForm, setBookForm] = useState({ name: '', hour: 9, duration: 1 })

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', selectedDay)
    if (!error) setBookings(data || [])
    setLoading(false)
  }, [selectedDay])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const isSlotBooked = (bay, hour) => {
    return bookings.some(b => b.bay === bay && (
      b.start_hour === hour || (b.duration === 2 && b.start_hour === hour - 1)
    ))
  }

  const getBayBookedCount = (bay) => HOURS.filter(h => isSlotBooked(bay, h)).length

  const getBookingAt = (bay, hour) => {
    let b = bookings.find(bk => bk.bay === bay && bk.start_hour === hour)
    if (b) return { ...b, isStart: true }
    b = bookings.find(bk => bk.bay === bay && bk.duration === 2 && bk.start_hour === hour - 1)
    if (b) return { ...b, isStart: false }
    return null
  }

  const handleBook = async () => {
    if (!bookForm.name.trim()) { showToast('Vui lòng nhập tên', 'error'); return }
    const { hour, duration } = bookForm
    if (hour + duration > 17) { showToast('Vượt quá thời gian hoạt động', 'error'); return }
    for (let h = hour; h < hour + duration; h++) {
      if (isSlotBooked(selectedBay, h)) { showToast('Khung giờ đã có người book', 'error'); return }
    }
    const { error } = await supabase.from('bookings').insert({
      bay: selectedBay, booking_date: selectedDay,
      start_hour: hour, duration, member_name: bookForm.name.trim(),
    })
    if (error) { showToast('Lỗi: ' + error.message, 'error'); return }
    showToast(`Đã book ${selectedBay} lúc ${hour}:00 cho ${bookForm.name}`)
    setModal(false); setBookForm({ name: '', hour: 9, duration: 1 }); fetchBookings()
  }

  const handleDelete = async (id) => {
    if (!confirm('Huỷ booking này?')) return
    await supabase.from('bookings').delete().eq('id', id)
    showToast('Đã huỷ booking')
    fetchBookings()
  }

  return (
    <div style={{ paddingTop: 20, paddingBottom: 40 }}>
      {/* Day selector */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
        {weekDates.map(d => (
          <button key={d.dateStr} onClick={() => setSelectedDay(d.dateStr)} style={S.dayBtn(selectedDay === d.dateStr, d.isToday)}>
            <span style={{ fontSize: 13 }}>{d.label}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>{d.shortDate}</span>
          </button>
        ))}
      </div>

      {loading ? <Loader text="Đang tải lịch..." /> : (
        <>
          {/* Bay grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: 10, marginBottom: 24 }}>
            {BAYS.map(bay => {
              const count = getBayBookedCount(bay)
              const pct = Math.round((count / HOURS.length) * 100)
              return (
                <button key={bay} onClick={() => setSelectedBay(bay)} style={S.bayCard(selectedBay === bay)}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🖥️</div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{bay}</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>Simulator 3D</div>
                  <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: '#e5e0d5', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: pct > 70 ? '#dc2626' : pct > 40 ? '#f59e0b' : '#16a34a', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: pct > 70 ? '#dc2626' : '#888', marginTop: 3, fontWeight: 600 }}>{pct}% booked</div>
                </button>
              )
            })}
          </div>

          {/* Time slots */}
          {selectedBay && (
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{selectedBay}</h3>
                  <span style={{ fontSize: 12, color: '#999' }}>{selectedDay} · 9:00 – 17:00</span>
                </div>
                <button onClick={() => setModal(true)} style={{ ...S.greenBtn, fontSize: 13, padding: '10px 20px' }}>+ Book giờ</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {HOURS.map(h => {
                  const bk = getBookingAt(selectedBay, h)
                  return (
                    <div key={h} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                      background: bk ? (bk.isStart ? '#f0fdf4' : '#f7fdf9') : '#fafaf7',
                      border: bk?.isStart ? '1px solid #bbf7d0' : '1px solid transparent',
                    }}>
                      <span style={{ ...S.mono, fontSize: 13, color: '#aaa', minWidth: 50 }}>{h}:00</span>
                      {bk ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {bk.isStart ? (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>BOOKED</span>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{bk.member_name}</span>
                                <span style={{ fontSize: 11, color: '#999' }}>({bk.duration}h)</span>
                              </div>
                              <button onClick={() => handleDelete(bk.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ccc', padding: 4 }} title="Huỷ">✕</button>
                            </>
                          ) : (
                            <span style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>↳ tiếp — {bk.member_name}</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: '#ccc' }}>Trống</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Book modal */}
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>Book giờ tập — {selectedBay}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Tên member</label>
              <input value={bookForm.name} onChange={e => setBookForm({ ...bookForm, name: e.target.value })} placeholder="Nhập tên..." style={S.input} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Giờ bắt đầu</label>
                <select value={bookForm.hour} onChange={e => setBookForm({ ...bookForm, hour: Number(e.target.value) })} style={S.input}>
                  {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Thời lượng</label>
                <select value={bookForm.duration} onChange={e => setBookForm({ ...bookForm, duration: Number(e.target.value) })} style={S.input}>
                  <option value={1}>1 giờ</option>
                  <option value={2}>2 giờ</option>
                </select>
              </div>
            </div>
            <button onClick={handleBook} style={{ ...S.greenBtn, marginTop: 6 }}>Xác nhận Book ⛳</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// VIDEOS TAB
// ═══════════════════════════════════════
function VideosTab() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('videos').select('*').order('session_date', { ascending: false })
      setVideos(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <Loader text="Đang tải video..." />

  return (
    <div style={{ paddingTop: 20, paddingBottom: 40 }}>
      <p style={{ fontSize: 13, color: '#999', marginTop: 0, marginBottom: 20 }}>
        Video swing được lưu sau mỗi buổi tập. Trainer nhận xét trực tiếp trên từng clip.
      </p>
      {videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>Chưa có video nào</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {videos.map(v => (
            <div key={v.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e0d5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{
                height: 160, background: 'linear-gradient(135deg, #1a3c2a 0%, #0d2818 60%, #1a4a32 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                {v.video_url ? (
                  <a href={v.video_url} target="_blank" rel="noopener noreferrer" style={{
                    position: 'absolute', width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(22,163,74,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 20px rgba(22,163,74,0.4)', textDecoration: 'none',
                  }}>
                    <div style={{ width: 0, height: 0, borderLeft: '18px solid #fff', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: 4 }} />
                  </a>
                ) : (
                  <span style={{ fontSize: 56 }}>🏌️</span>
                )}
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 6, fontSize: 12, ...S.mono, color: '#ccc' }}>{v.duration_minutes} phút</div>
                <div style={{ position: 'absolute', top: 10, left: 10, background: '#16a34a', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#fff' }}>{v.bay}</div>
                {v.focus && <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 6, fontSize: 11, color: '#4ade80', fontWeight: 600 }}>{v.focus}</div>}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{v.member_name}</span>
                  <span style={{ fontSize: 12, color: '#999', ...S.mono }}>{new Date(v.session_date).toLocaleDateString('vi')}</span>
                </div>
                {v.trainer_comment && (
                  <div style={{ background: '#f7f5f0', borderRadius: 12, padding: 14, borderLeft: '3px solid #16a34a' }}>
                    <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 800, marginBottom: 6 }}>💬 NHẬN XÉT TRAINER</div>
                    <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.6 }}>{v.trainer_comment}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// OUTINGS TAB
// ═══════════════════════════════════════
function OutingsTab({ showToast }) {
  const [outings, setOutings] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [registerName, setRegisterName] = useState('')

  const fetchOutings = useCallback(async () => {
    const { data } = await supabase
      .from('outings')
      .select('*, outing_registrations(id, member_name)')
      .order('event_date', { ascending: true })
    setOutings(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOutings() }, [fetchOutings])

  const handleRegister = async (outing) => {
    if (!registerName.trim()) { showToast('Vui lòng nhập tên', 'error'); return }
    const existing = outing.outing_registrations || []
    if (existing.length >= outing.max_slots) { showToast('Đã hết slot!', 'error'); return }
    if (existing.some(r => r.member_name.toLowerCase() === registerName.trim().toLowerCase())) {
      showToast('Tên đã đăng ký!', 'error'); return
    }
    const { error } = await supabase.from('outing_registrations').insert({
      outing_id: outing.id, member_name: registerName.trim(),
    })
    if (error) { showToast('Lỗi: ' + error.message, 'error'); return }
    showToast(`Đã đăng ký ${registerName} thành công!`)
    setRegisterName(''); setModal(null); fetchOutings()
  }

  if (loading) return <Loader text="Đang tải outing..." />

  return (
    <div style={{ paddingTop: 20, paddingBottom: 40 }}>
      {outings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>Chưa có outing nào</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {outings.map(o => {
            const regs = o.outing_registrations || []
            const remaining = o.max_slots - regs.length
            const isFull = remaining <= 0
            const pct = Math.min(100, Math.round((regs.length / o.max_slots) * 100))
            return (
              <div key={o.id} style={{ ...S.card, border: isFull ? '1px solid #fecaca' : '1px solid #e5e0d5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>{o.name}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999', ...S.mono }}>📅 {new Date(o.event_date).toLocaleDateString('vi')}</p>
                  </div>
                  <div style={{
                    background: isFull ? '#fef2f2' : '#f0fdf4', color: isFull ? '#dc2626' : '#16a34a',
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                    border: isFull ? '1px solid #fecaca' : '1px solid #bbf7d0',
                  }}>{isFull ? 'HẾT SLOT' : `Còn ${remaining} slot`}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 4 }}>
                    <span>{regs.length}/{o.max_slots} golfer</span><span>{pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: '#e5e0d5', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, transition: 'width 0.3s', background: isFull ? '#dc2626' : 'linear-gradient(90deg, #16a34a, #4ade80)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {regs.map(r => (
                    <span key={r.id} style={{ background: '#f7f5f0', padding: '4px 10px', borderRadius: 8, fontSize: 12, color: '#666', border: '1px solid #ede8de' }}>{r.member_name}</span>
                  ))}
                </div>
                {!isFull && (
                  <button onClick={() => setModal(o)} style={{ ...S.greenBtn, width: '100%' }}>Đăng ký tham gia ⛳</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Register modal */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>Đăng ký: {modal.name}</h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#999' }}>Còn {modal.max_slots - (modal.outing_registrations?.length || 0)} slot trống</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Tên của bạn</label>
              <input value={registerName} onChange={e => setRegisterName(e.target.value)} placeholder="Nhập tên..." style={S.input} />
            </div>
            <button onClick={() => handleRegister(modal)} style={S.greenBtn}>Xác nhận đăng ký ⛳</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Shared components ───
const labelStyle = { fontSize: 12, color: '#999', fontWeight: 600, display: 'block', marginBottom: 6 }

function Modal({ onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '20px 20px 0 0', padding: 24,
        width: '100%', maxWidth: 500, maxHeight: '70vh', overflowY: 'auto', animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#ddd', margin: '0 auto 20px' }} />
        {children}
      </div>
    </div>
  )
}
