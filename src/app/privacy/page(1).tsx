import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = pageMetadata({ title: "Privacy Policy", description: `How ${brand.name} collects and uses personal information.`, path: "/privacy" });

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section><h2>Who we are</h2><p>{brand.legalName} [registered company name, address, and contact email]. We are responsible for the personal information described in this policy.</p></section>
      <section><h2>What we collect</h2><ul>
        <li>Details you give us in enquiry and checkout forms: name, email, phone, delivery address, and your message.</li>
        <li>Order details: the products you buy and the amounts paid.</li>
        <li>Payment details are entered directly with our payment provider [provider name]. We do not receive or store full card numbers.</li>
        <li>Your shopping bag is stored in your own browser so it persists between visits.</li>
      </ul></section>
      <section><h2>How we use it</h2><ul>
        <li>To reply to enquiries and process, deliver, and support your orders.</li>
        <li>To send marketing emails only if you have opted in. You can unsubscribe at any time.</li>
        <li>To meet legal, tax, and accounting obligations.</li>
      </ul></section>
      <section><h2>Who we share it with</h2><p>Service providers that help us operate: [payment provider], [email provider], [newsletter provider], [hosting provider], and [delivery partners]. Each processes data only to provide its service.</p></section>
      <section><h2>How long we keep it</h2><p>[Retention periods for enquiries, orders, and marketing lists.]</p></section>
      <section><h2>Your rights</h2><p>You can ask to access, correct, or delete your personal information, or withdraw consent, by contacting [contact email]. [Add rights applicable under the Digital Personal Data Protection Act, 2023 and any other laws that apply to you.]</p></section>
    </LegalPage>
  );
}
