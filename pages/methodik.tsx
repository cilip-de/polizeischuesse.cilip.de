import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

import Layout from "../components/Layout";
import medCov from "../public/methodik_cover.jpg";

const Daten: NextPage = () => {
  return (
    <Layout
      metaImg="methodik_cover.jpg"
      metaPath="methodik"
      title="Methodik: Woher stammen unsere Informationen?"
      description="Seit 1976 sammelt die CILIP Informationen zu polizeilichen Todesschüssen. Wir zählen alle Fälle, in denen Menschen durch eine Polizeikugel gestorben sind."
      cover={
        <Image
          src={medCov}
          alt="Methodik Cover"
          style={{
            width: "90%",
            height: "auto",
            marginTop: "0.5rem",
            marginLeft: "5%",
            marginRight: "5%",
          }}
        />
      }
    >
      <div>
        Hier dokumentieren wir jedoch nur die dienstliche Verwendung der Waffen,
        deshalb beziehen wir etwa die zahlreichen „erweiterten Suizide“, in
        denen Polizisten zuvor Partnerinnen oder Angehörige töten, nicht ein.
        Ebenfalls nicht gezählt sind Situationen, in denen dies außerhalb des
        Dienstes erfolgt. Dies betrifft mindestens zwei Fälle von 1986 und 1995,
        in denen Polizisten zur Aushilfe an einer Tankstelle arbeiteten und bei
        einem Überfall ihre Dienstwaffe eingesetzt haben.
        <br />
        <br />
        Die Todesschüsse recherchiert unser Redakteur Otto Diederichs gewöhnlich
        in der Presse. Früher erfolgte dies durch die Sichtung von gedruckten
        Tageszeitungen, heute ausschließlich im Internet. Die dortigen Angaben
        sind mit Vorsicht zu genießen, denn oft überwiegt darin die Darstellung
        und mithin die Sichtweise der Polizei.
        <br />
        <br />
        Weitere Details erfragen wir anschließend bei den zuständigen
        Polizeibehörden oder Staatsanwaltschaften. Vor der{" "}
        <a href="https://www.cilip.de/category/polizeiliche-todesschuesse/">
          Veröffentlichung in unserer Zeitschrift
        </a>{" "}
        gleichen wir unsere Sammlung mit der jährlichen
        Schusswaffengebrauchsstatistik der Deutschen Hochschule der Polizei
        (DhPol) ab. Manchmal müssen wir dann Fälle ergänzen, die uns nicht
        bekannt wurden. Mitunter korrigieren wir unsere Zählung auch, etwa wenn
        die von uns gezählten Todesschüsse lediglich zu einer schweren
        Verletzung geführt haben. Einige Fälle haben wir womöglich auch nicht
        korrekt dargestellt, etwa wenn sich von uns unbemerkt neue Sachverhalte
        ergeben haben und dies in der Fallbeschreibung nicht ergänzt ist.
        <br />
        <br />
        Diskrepanzen ergeben sich, wenn die staatsanwaltlichen Ermittlungen zur
        Todesursache nach einem Schusswaffengebräuchen nicht abgeschlossen sind.
        Dann werden die Fälle als „offen“ bewertet, sie tauchen also in der
        offiziellen Jahresstatistik nicht als „Tote“ auf. Dies hat die DhPol
        erst ab 2014 mit der neuen Rubrik „noch nicht klassifizierte Fälle
        (Folgen)“ berücksichtigt.
        <br />
        <br />
        Unsere Fallbeschreibungen sind mit den Jahren umfangreicher geworden,
        für die Anfangszeit erläutern sie die Taten jedoch nur knapp. So bleibt
        etwa das Geschlecht der Getöteten bis zum Jahr 1982 häufig offen. In der
        neuen Übersicht haben wir ab den Nullerjahren Online-Quellen
        nachgetragen. Nachweise zu den früheren Ereignissen finden sich in
        unserem Zeitungsarchiv, in das wir auf Anfrage gern Einblick gewähren.
        <br />
        <br />
        Nachträglich haben wir die Fälle nach Hinweisen auf eine psychische
        Ausnahmesituation der Opfer durchsucht und markiert. Damit wollen wir
        unsere These stützen, dass dies seit einigen Jahren eine der häufigsten
        Todesursachen durch Polizeischüsse darstellt. Davon betroffen sind
        ebenfalls sehr häufig Menschen in ihrer eigenen Wohnung, etwa wenn sie
        als Reaktion auf das polizeiliche Eindringen oder im Gefühl des
        Bedrohtseins plötzlich zu einem Messer greifen. Deshalb haben wir die
        Fälle auch nach Schussabgaben innerhalb und außerhalb von Gebäuden
        sortiert. Nicht immer ließ sich dies jedoch exakt rekonstruieren. Für
        einen Überblick dazu hilft die Suche in den Meldungen mit dem Stichwort{" "}
        <Link href="/?q=Wohnun&p=1#chronik">„Wohnung“</Link>
        .
        <br />
        <br />
        2017 haben Erik Peter und Svenja Bednarczyk in der taz eigene Recherchen
        zu unserer Sammlung angestellt und diese{" "}
        <a href="https://web.archive.org/web/20210129215547/https://taz.atavist.com/polizeitote">
          visualisiert
        </a>
        . Auch{" "}
        <a href="https://schusswaffeneinsatz.de/download/toetung-durch-polizeibeamte%20(1).pdf">
          Clemens Lorei
        </a>{" "}
        dokumentiert den polizeilichen Schusswaffengebrauch in Deutschland auf
        seiner Webseite und beruft sich dabei oft auf die CILIP. Die Kampagne
        <a href="https://doku.deathincustody.info/">„Death in Custody“</a>{" "}
        sammelt zudem Informationen zu Todesfällen von Schwarzen Menschen,
        People of Color und von Rassismus betroffenen Personen in Gewahrsam
        sowie durch Polizeigewalt im Allgemeinen. Außerdem dokumentiert die{" "}
        <a href="https://www.ari-dok.org/webdokumentation/">
          Antirassistische Initiative e.V.
        </a>{" "}
        seit 1993 Geschehnisse, in denen Geflüchtete durch staatliche Maßnahmen
        sowie durch rassistische Angriffe der Bevölkerung verletzt wurden oder
        zu Tode kamen. Die Webseite{" "}
        <a href="https://www.copservation.de/">„Copservation“</a> 
        sammelt indes Übergriffe und Verstöße von Polizist*innen. Eine ähnliche
        Übersicht gibt es auf{" "}
        <a href="https://www.reddit.com/r/pozilei/">Reddit</a>.
      </div>
    </Layout>
  );
};

export default Daten;
