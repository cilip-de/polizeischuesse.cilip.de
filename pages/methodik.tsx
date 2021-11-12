import type { NextPage } from "next";
import Link from "next/link";
import React from "react";
import Layout from "../components/Layout";

const Daten: NextPage = () => {
  return (
    <Layout
      title="Methodik: Woher stammen unsere Informationen?"
      description="Wir zählen alle Fälle, in denen Menschen durch eine Polizeikugel gestorben sind. Dabei beziehen wir auch die sehr wenigen Situationen, in denen dies außerhalb des Dienstes oder bei bekannt gewordenen Fällen von Suizid geschieht, mit ein."
    >
      <div>
        Wir recherchieren unsere Fälle zum tödlichen Gebrauch von Schusswaffen
        und Tasern gewöhnlich in der Presse. Früher erfolgte dies durch die
        Sichtung von gedruckten Tageszeitungen, heute ausschließlich im
        Internet. Weitere Details haben wir anschließend bei den zuständigen
        Polizeibehörden oder Staatsanwaltschaften erfragt. Deren Angaben sind
        mit Vorsicht zu genießen, denn auch in der Presse überwiegt oft die
        Darstellung und mithin die Sichtweise der Polizei. Auch die Hinweise zur
        Beteiligung von polizeilichen Spezialkräften sind womöglich
        unvollständig, möglicherweise wurde dies auch nicht immer von den
        Zeitungen gemeldet.
        <br />
        <br />
        Unsere Sammlung gleichen wir vor der{" "}
        <a href="https://www.cilip.de/category/polizeiliche-todesschuesse/">
          Veröffentlichung in unserer Zeitschrift
        </a>{" "}
        mit der jährlichen Schusswaffengebrauchsstatistik der Deutschen
        Hochschule der Polizei (DhPol) ab. Manchmal müssen wir dann Fälle
        ergänzen, die uns nicht bekannt wurden. Mitunter korrigieren wir unsere
        Zählung auch, etwa wenn die von uns gezählten Todesschüsse lediglich zu
        einer schweren Verletzung geführt haben. Einige Fälle haben wir
        womöglich auch nicht korrekt dargestellt, etwa wenn sich von uns
        unbemerkt neue Sachverhalte ergeben haben und dies in der
        Fallbeschreibung nicht ergänzt ist.
        <br />
        <br />
        Weitere Diskrepanzen ergeben sich, wenn die staatsanwaltlichen
        Ermittlungen zu den Schusswaffengebräuchen noch nicht abgeschlossen
        sind. Dann werden die Fälle als „offen“ bewertet, sie tauchen also in
        der Jahresstatistik der DhPol nicht auf. Abhilfe würde eine Zählung
        schaffen, die einen staatsanwaltlichen Vorbehalt vorsieht.
        <br />
        <br />
        Unsere Fallbeschreibungen sind mit den Jahren etwas umfangreicher
        geworden, für die Anfangszeit erläutern sie die Taten jedoch nur sehr
        knapp. Wir haben es damals versäumt, die Meldungen mit Quellen zu
        belegen und dies erst für die Ereignisse ab der Jahrtausendwende
        nachgeholt. Deshalb sind viele Fälle nur schwer nachprüfbar, teilweise
        bleiben sie auch unvollständig. So bleibt das Geschlecht der Getöteten
        bis zum Jahr 1982 mitunter unbekannt.
        <br />
        <br />
        Nachträglich haben wir die Fälle nach Hinweisen auf eine psychische
        Ausnahmesituation der Opfer durchsucht und markiert. Damit wollen wir
        unsere These stützen, dass dies seit einigen Jahren eine der häufigsten
        Todesursachen durch Polizeischüsse darstellt. Davon betroffen sind
        ebenfalls sehr häufig Menschen in ihrer eigenen Wohnung, etwa wenn sich
        diese in Reaktion auf das polizeiliche Eingreifen oder im Gefühl des
        Bedrohtseins plötzlich mit einem Messer bewaffnen. Deshalb haben wir die
        Fälle auch nach Schussabgaben innerhalb und außerhalb von Gebäuden
        sortiert. Nicht immer ließ sich dies jedoch exakt rekonstruieren. Für
        einen Überblick hilft auch die Suche in den einzelnen Meldungen mit dem
        Stichwort{" "}
        <Link href="/?q=Wohnun&p=1#chronik">
          <a>„Wohnung“</a>
        </Link>
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
        seiner Webseite und beruft sich dabei oft auf die CILIP.
      </div>
    </Layout>
  );
};

export default Daten;
