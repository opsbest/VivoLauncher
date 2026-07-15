import Navbar from '../components/Navbar.jsx'
import UpdatePanel from '../components/UpdatePanel.jsx'
import './ContentPage.css'

const patchNotes = [
  {
    version: '1.21.4',
    text: 'En güncel içerikleri, yeni zindanları ve gelişmiş teknik özellikleri deneyimlemek isteyenler için en yeni ve kapsamlı sürüm.',
  },
  {
    version: '1.16.5',
    text: 'Nether dünyasına getirdiği köklü yenilikler ve modlu oynanıştaki yüksek kararlılığı ile oyuncuların en çok tercih ettiği klasikleşmiş sürüm.',
  },
  {
    version: '1.8.9',
    text: 'PvP odaklı oyuncuların vazgeçilmezi olan, kendine has dövüş mekanikleri ve yüksek performans sunan klasikleşmiş bir PvP sürümü.',
  }
]

export default function PatchNotesPage() {
  return (
    <div className="content-page">
      <Navbar />

      <div className="update-content-list">
        {patchNotes.map((note) => (
          <UpdatePanel key={note.version} title={note.version}>
            {note.text}
          </UpdatePanel>
        ))}
      </div>
    </div>
  )
}
