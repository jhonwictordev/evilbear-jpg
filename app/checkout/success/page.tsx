import Link from "next/link";
import { PaymentStatus } from "@/components/beat-store/payment-status";
import { StoreNav } from "@/components/beat-store/store-nav";
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) { const { order } = await searchParams; return <><StoreNav /><main className="store-page checkout-success"><p className="store-kicker">STATUS DO PEDIDO</p><h1>PAGAMENTO<br /><span>EM ANÁLISE.</span></h1><PaymentStatus orderNumber={order} /><Link href="/beats">VOLTAR AO CATÁLOGO ↗</Link></main></>; }
