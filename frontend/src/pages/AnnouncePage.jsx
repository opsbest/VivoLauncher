import Navbar from '../components/Navbar.jsx'
import UpdatePanel from '../components/UpdatePanel.jsx'
import './ContentPage.css'

export default function AnnouncePage() {
  return (
    <div className="content-page">
      <Navbar />

      <div className="update-content-list">
        <UpdatePanel title="Merhaba Mesajı!">
          Açık kaynaklı projemize gösterdiğiniz destek için teşekkürler! Sayenizde her geçen gün daha geniş bir kitleye ulaşıyoruz. Geliştirme sürecimiz hızla devam ediyor; çok yakında yeni sürüm güncellemeleri ve yepyeni özelliklerle projemizi daha güçlü hale getireceğiz. Takipte kalın!
        </UpdatePanel>
      </div>
    </div>
  )
}
