import React from 'react';
import "./About.css";

// The project story from the README. A native <dialog> opened with showModal() traps focus,
// closes on Esc and blocks the page behind it, so none of that needs code here.
class About extends React.Component {
    componentDidMount() {
        // Esc, the close button and the backdrop all end in the dialog's own close event.
        this.dialog.addEventListener('close', this.handleClose);
        this.sync();
    }

    componentDidUpdate() {
        this.sync();
    }

    componentWillUnmount() {
        this.dialog.removeEventListener('close', this.handleClose);
    }

    handleClose = () => {
        this.props.onClose();
    }

    sync() {
        if (this.props.open && !this.dialog.open) this.dialog.showModal();
        if (!this.props.open && this.dialog.open) this.dialog.close();
    }

    // A click on the backdrop lands on the <dialog> element itself, not on its content.
    handleClick = (event) => {
        if (event.target === this.dialog) this.dialog.close();
    }

    render() {
        return (
            <dialog ref={el => this.dialog = el} className="aboutDialog" aria-labelledby="aboutTitle" onClick={this.handleClick}>
                <div className="aboutDialog-content">
                    <header className="aboutDialog-header">
                        <h2 id="aboutTitle">Harita Ankara nedir?</h2>
                        <button type="button" className="iconButton" onClick={() => this.dialog.close()} aria-label="Kapat">×</button>
                    </header>

                    <p>
                        “Harita Ankara” keyfekeder yaptığım bir çalışma, hadi mesleki deformasyon ürünü diyelim.
                        Angara bebesi olarak eski haritaları sürekli inceleyip Atatürk’ün ve Cumhuriyet Dönemi'nin
                        eserlerine bakarken, bunları günümüzle karşılaştırmak istedim.
                    </p>
                    <p>
                        Belki tarihsel süreçte kente kazandırılanları ve kente yapılan eziyetleri de izlemek olanaklı olur.
                        Özellikle “Ankara’nın Altında Dereler Var” belgeselini izledikten sonra her dönem yapılan eziyet
                        biraz daha anlaşılır oluyor.
                    </p>

                    <h3>Neler görebilirsiniz?</h3>
                    <ul>
                        <li>Tüm akarsuların bugün yol olduğunu,</li>
                        <li>AŞTİ’nin bulunduğu alanın 1957 planında golf sahası olarak bırakıldığını,</li>
                        <li>1940’ta Anıtkabir’in henüz olmadığını,</li>
                        <li>2000’de Bağlıca’nın henüz bir köy olduğunu.</li>
                    </ul>

                    <h3>Nasıl yapıldı?</h3>
                    <p>
                        Üniversite hocalarımdan ve birkaç sivil toplum kuruluşundan arşiv paylaşmalarını istedim, cevap alamadım.
                        Harita ve planların tümünü internetten buldum, buldukça da eklemeye devam ediyorum.
                    </p>
                    <p>
                        Bulduklarım yalnız bir imajdı, koordinat bilgileri yoktu. En çok zamanımı alan bunları koordinatlandırma
                        işlemi oldu. Bu işlem sonrasında oluşan GeoTIFF’leri Mapbox’ta yayımladım ve Mapbox GL JS, React ve
                        Bootstrap kullanarak online harita haline getirdim. Uydu görüntülerini yine Mapbox sağlıyor.
                    </p>

                    <h3>Bana ulaşın</h3>
                    <p>
                        Her konuda bana ulaşın. Özellikle “<span role="img" aria-label="el kaldırma">✋</span> işte o benim! Benim eski bir haritam var” diyenler.
                        “Şunu da yapsanaaaa yaaaa” değil de “benim de yapacaklarım var” diyenlerin daha sık ulaşmasını bekliyorum.
                    </p>

                    <footer className="aboutDialog-links">
                        <a href="mailto:ibrahimsaricicek@gmail.com">E-posta</a>
                        <a href="https://www.linkedin.com/in/ibrahimsaricicek/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://github.com/saricicekibrahim/haritaANKARA" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </footer>
                </div>
            </dialog>
        );
    }
}

export default About;
