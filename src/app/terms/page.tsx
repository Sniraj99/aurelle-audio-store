import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = pageMetadata({ title: "Terms and Conditions", description: `Terms for using the ${brand.name} website and buying from us.`, path: "/terms" });

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions">
      <section><h2>About these terms</h2><p>These terms apply when you use this website or place an order with {brand.legalName} [registered name and address].</p></section>
      <section><h2>Products and pricing</h2><ul>
        <li>We describe products as accurately as we can. Images may differ slightly from the product due to lighting and screens.</li>
        <li>Prices are shown in Indian Rupees. [State whether prices include GST.]</li>
        <li>Prices are confirmed on our server when you check out. If an error is found, we will contact you before processing the order.</li>
      </ul></section>
      <section><h2>Orders</h2><p>An order is accepted when payment is verified and we send a confirmation. [Describe cancellation rights before dispatch.]</p></section>
      <section><h2>Enquiry-only products</h2><p>Some products are supplied by quotation. A quotation is not an order until you accept it in writing and payment terms are agreed.</p></section>
      <section><h2>Warranty</h2><p>[Describe any manufacturer or seller warranty only once it is confirmed in writing.]</p></section>
      <section><h2>Liability and governing law</h2><p>[Limitation of liability. Governing law and jurisdiction.]</p></section>
    </LegalPage>
  );
}
