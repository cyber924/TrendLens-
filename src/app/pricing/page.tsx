import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "무료",
    price: "₩0",
    frequency: "/월",
    description: "시작하는 개인을 위한 플랜입니다.",
    features: [
      "기본 트렌드 분석",
      "월 1회 CSV 업로드",
      "제한된 AI 생성",
      "커뮤니티 지원",
    ],
    cta: "시작하기",
    href: "/signup"
  },
  {
    name: "프로",
    price: "₩49,000",
    frequency: "/월",
    description: "소규모 기업 및 마케터를 위한 플랜입니다.",
    features: [
      "전체 트렌드 분석",
      "월 50회 CSV 업로드",
      "무제한 AI 생성",
      "대시보드 접근",
      "이메일 지원",
    ],
    cta: "프로로 업그레이드",
    href: "/signup",
    highlight: true,
  },
  {
    name: "엔터프라이즈",
    price: "맞춤",
    frequency: "",
    description: "대규모 팀을 위한 플랜입니다.",
    features: [
      "모든 프로 기능",
      "API 접근",
      "전담 계정 관리자",
      "맞춤형 통합",
      "연중무휴 우선 지원",
    ],
    cta: "영업팀에 문의",
    href: "/contact"
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">요금제</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          귀하의 이커머스 전략에 힘을 실어줄 완벽한 플랜을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col ${tier.highlight ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div>
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">{tier.frequency}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={tier.highlight ? "default" : "outline"}>
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
