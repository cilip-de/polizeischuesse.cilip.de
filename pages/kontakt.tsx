import { Center, Space, Title } from "@mantine/core";
import type { NextPage } from "next";
import Link from "next/link";
import Layout from "../components/Layout";

const privacyHtml = `
<h3 id="dsg-general-intro"></h3>
<p>Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten (nachfolgend
  kurz „Daten“) im Rahmen der Erbringung unserer Leistungen sowie innerhalb unseres Onlineangebotes und der mit ihm verbundenen
  Webseiten, Funktionen und Inhalte sowie externen Onlinepräsenzen, wie z.B. unsere Social Media Profile auf (nachfolgend
  gemeinsam bezeichnet als „Onlineangebot“). Im Hinblick auf die verwendeten Begrifflichkeiten, wie z.B. „Verarbeitung“ oder
  „Verantwortlicher“ verweisen wir auf die Definitionen im Art. 4 der Datenschutzgrundverordnung (DSGVO).
  <br>
  <br>
</p>
<h3 id="dsg-general-controller">Verantwortlicher</h3>

<p>Institut für Bürgerrechte & öffentliche Sicherheit e.V.
<br />
c/o Juristische Fakultät Humboldt-Universität zu Berlin
<br />
Unter den Linden 6<br />
10099 Berlin (Germany)
<br />
<br />
vertreten durch den Vorstand: Norbert Pütter
</p>


<h3 id="dsg-general-datatype">Arten der verarbeiteten Daten</h3>
<p>- Nutzungsdaten (z.B., besuchte Webseiten, Interesse an Inhalten, Zugriffszeiten).
  <br> - Meta-/Kommunikationsdaten (z.B., Geräte-Informationen, IP-Adressen).</p>
<h3 id="dsg-general-datasubjects">Kategorien betroffener Personen</h3>
<p>Besucher und Nutzer des Onlineangebotes (Nachfolgend bezeichnen wir die betroffenen Personen zusammenfassend auch als „Nutzer“).
  <br>
</p>
<h3 id="dsg-general-purpose">Zweck der Verarbeitung</h3>
<p>- Reichweitenmessung/Marketing
  <br>
  <span class="tsmcom"></span>
</p>
<h3 id="dsg-general-terms">Verwendete Begrifflichkeiten </h3>
<p>„Personenbezogene Daten“ sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person
  (im Folgenden „betroffene Person“) beziehen; als identifizierbar wird eine natürliche Person angesehen, die direkt oder
  indirekt, insbesondere mittels Zuordnung zu einer Kennung wie einem Namen, zu einer Kennnummer, zu Standortdaten, zu einer
  Online-Kennung (z.B. Cookie) oder zu einem oder mehreren besonderen Merkmalen identifiziert werden kann, die Ausdruck der
  physischen, physiologischen, genetischen, psychischen, wirtschaftlichen, kulturellen oder sozialen Identität dieser natürlichen
  Person sind.
  <br>
  <br> „Verarbeitung“ ist jeder mit oder ohne Hilfe automatisierter Verfahren ausgeführte Vorgang oder jede solche Vorgangsreihe
  im Zusammenhang mit personenbezogenen Daten. Der Begriff reicht weit und umfasst praktisch jeden Umgang mit Daten.
  <br>
  <br> „Pseudonymisierung“ die Verarbeitung personenbezogener Daten in einer Weise, dass die personenbezogenen Daten ohne Hinzuziehung
  zusätzlicher Informationen nicht mehr einer spezifischen betroffenen Person zugeordnet werden können, sofern diese zusätzlichen
  Informationen gesondert aufbewahrt werden und technischen und organisatorischen Maßnahmen unterliegen, die gewährleisten,
  dass die personenbezogenen Daten nicht einer identifizierten oder identifizierbaren natürlichen Person zugewiesen werden.
  <br>
  <br> „Profiling“ jede Art der automatisierten Verarbeitung personenbezogener Daten, die darin besteht, dass diese personenbezogenen
  Daten verwendet werden, um bestimmte persönliche Aspekte, die sich auf eine natürliche Person beziehen, zu bewerten, insbesondere
  um Aspekte bezüglich Arbeitsleistung, wirtschaftliche Lage, Gesundheit, persönliche Vorlieben, Interessen, Zuverlässigkeit,
  Verhalten, Aufenthaltsort oder Ortswechsel dieser natürlichen Person zu analysieren oder vorherzusagen.
  <br>
  <br> Als „Verantwortlicher“ wird die natürliche oder juristische Person, Behörde, Einrichtung oder andere Stelle, die allein
  oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet, bezeichnet.
  <br>
</p>
<h3 id="dsg-logfiles">Erhebung von Zugriffsdaten und Logfiles</h3>
<p></p>
<p>
  <span class="ts-muster-content">Wir, bzw. unser Hostinganbieter, erhebt auf Grundlage unserer berechtigten Interessen im Sinne des Art. 6 Abs. 1 lit. f.
    DSGVO Daten über jeden Zugriff auf den Server, auf dem sich dieser Dienst befindet (sogenannte Serverlogfiles). Zu den
    Zugriffsdaten gehören Name der abgerufenen Webseite, Datei, Datum und Uhrzeit des Abrufs, übertragene Datenmenge, Meldung
    über erfolgreichen Abruf, Browsertyp nebst Version, das Betriebssystem des Nutzers, Referrer URL (die zuvor besuchte
    Seite), IP-Adresse und der anfragende Provider.
    <br>
    <br> Logfile-Informationen werden aus Sicherheitsgründen (z.B. zur Aufklärung von Missbrauchs- oder Betrugshandlungen) für
    die Dauer von maximal 7 Tagen gespeichert und danach gelöscht. Daten, deren weitere Aufbewahrung zu Beweiszwecken erforderlich
    ist, sind bis zur endgültigen Klärung des jeweiligen Vorfalls von der Löschung ausgenommen.</span>
</p>
<p></p>
<h3 id="dsg-matomo">Reichweitenmessung mit Matomo</h3>
<p></p>
<p>
  <span class="ts-muster-content">Im Rahmen der Reichweitenanalyse von Matomo werden auf Grundlage unserer berechtigten Interessen (d.h. Interesse an der
    Analyse, Optimierung und wirtschaftlichem Betrieb unseres Onlineangebotes im Sinne des Art. 6 Abs. 1 lit. f. DSGVO) die
    folgenden Daten verarbeitet: der von Ihnen verwendete Browsertyp und die Browserversion, das von Ihnen verwendete Betriebssystem,
    Ihr Herkunftsland, Datum und Uhrzeit der Serveranfrage, die Anzahl der Besuche, Ihre Verweildauer auf der Website sowie
    die von Ihnen betätigten externen Links. Die IP-Adresse der Nutzer wird anonymisiert, bevor sie gespeichert wird.
    <br>
    <br> Matomo verwendet Cookies, die auf dem Computer der Nutzer gespeichert werden und die eine Analyse der Benutzung unseres
    Onlineangebotes durch die Nutzer ermöglichen. Dabei können aus den verarbeiteten Daten pseudonyme Nutzungsprofile der
    Nutzer erstellt werden. Die Cookies haben eine Speicherdauer von einer Woche. Die durch das Cookie erzeugten Informationen
    über Ihre Benutzung dieser Webseite werden nur auf unserem Server gespeichert und nicht an Dritte weitergegeben.
    <br>
    <br> Nutzer können der anonymisierten Datenerhebung durch das Programm Matomo jederzeit mit Wirkung für die Zukunft widersprechen,
    indem sie auf den untenstehenden Link klicken. In diesem Fall wird in ihrem Browser ein sog. Opt-Out-Cookie abgelegt,
    was zur Folge hat, dass Matomo keinerlei Sitzungsdaten mehr erhebt. Wenn Nutzer ihre Cookies löschen, so hat dies jedoch
    zur Folge, dass auch das Opt-Out-Cookie gelöscht wird und daher von den Nutzern erneut aktiviert werden muss.
    <br>
    <br> Die Logs mit den Daten der Nutzer werden nach spätestens 6 Monaten gelöscht.
    <br>
    <br>
    <a href="https://matomo.daten.cool/index.php?module=CoreAdminHome&action=optOut&language=en&backgroundColor=&fontColor=&fontSize=&fontFamily=">Matomo-Einstellungen hier ändern.</a>

</p>
<a href="https://datenschutz-generator.de" class="dsg1-6" rel="nofollow" target="_blank">Erstellt mit Datenschutz-Generator.de von RA Dr. Thomas Schwenke</a>`;

const Kontakt: NextPage = () => {
  return (
    <Layout
      metaImg="contact_cover.jpg"
      metaPath="kontakt"
      title="Wie ihr uns erreichen könnt"
      description="und einige rechtliche Informationen"
      cover={
        <div>
          <Center>
            <img
              src="/contact_cover.jpg"
              style={{
                width: "90%",
                marginTop: "0.5rem",
                marginLeft: "5%",
                marginRight: "5%",
              }}
            />
          </Center>
        </div>
      }
      otherContent={
        <>
          <Space h="xl" />
          <Title order={2}>Kontakt</Title>
          <p>
            Schreibt uns bitte eine E-Mail an{" "}
            <a href="mailto:info@cilip">info@cilip.de</a> und folgt uns auf
            Twitter <a href="https://twitter.com/cilip_de">@cilip_de</a> und
            Mastodon{" "}
            <a href="https://social.tchncs.de/@cilip">
              @social.tchncs.de/@cilip
            </a>
            . Nutzt auch gern unser{" "}
            <Link href="/fall-melden">Kontakt-Formular</Link> um uns Updates zu
            Fällen zu schicken.
          </p>
          <p>
            Der Software-Code dieser Webseite ist auf{" "}
            <a href="https://github.com/cilip-de/polizeischuesse.cilip.de">
              GitHub
            </a>
            .
          </p>
          <Space />
          <Title order={2}>Impressum</Title>
          <Space />
        </>
      }
    >
      <div>
        Verantwortlich für die Webseite im Sinne des TDG, MDStV sowie des
        Presserechts ist das
        <br />
        <br />
        Institut für Bürgerrechte & öffentliche Sicherheit e.V.
        <br />
        c/o Juristische Fakultät Humboldt-Universität zu Berlin
        <br />
        Unter den Linden 6<br />
        10099 Berlin (Germany)
        <br />
        <br />
        vertreten durch den Vorstand: Norbert Pütter
        <br />
        <br />
        Hiermit erklären der Vorstand des Instituts für Bürgerrechte &
        offentliche Sicherheit e.V. sowie die Gesellschafterin des Verlages
        CILIP GbR, Martina Kant, (V.i.S.d. TDG, MDStV sowie des Presserechts),
        dass wir keinen Einfluss auf die Gestaltung und den Inhalt derjenigen
        Internetpräsenzen haben, auf die von dieser Internetpräsenz aus
        verwiesen wird. Wir sind nicht für den Inhalt der verlinkten fremden
        Internetpräsenzen verantwortlich und machen uns diesen Inhalt nicht zu
        eigen. Die Haftung für die Vollständigkeit, die Fehlerfreiheit, die
        Erreichbarkeit oder die Qualität dieser fremden Internetpräsenzen ist
        ausgeschlossen.
        <br />
        <br />
        Eine Haftung für die Aktualität, die Vollständigkeit, die
        Fehlerfreiheit, die Erreichbarkeit oder die Qualität der von uns
        bereitgestellten Informationen ist ausgeschlossen. Hiermit behalten wir
        uns ausdrücklich das Recht vor, ohne Vorankündigung und ohne
        Rechtfertigung dieses Angebot zu verändern oder ganz einzustellen.
      </div>
      <Space />
      <Title order={2}>Datenschutzerklärung</Title>
      <div dangerouslySetInnerHTML={{ __html: privacyHtml }} />
    </Layout>
  );
};

export default Kontakt;
