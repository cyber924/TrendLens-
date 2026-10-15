
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MessageSquare, DollarSign } from 'lucide-react';

type KeyMetricsProps = {
    price: number;
    reviewCount: number;
}

export function KeyMetricsCard({ price, reviewCount }: KeyMetricsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        가격
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {price > 0 ? `${price.toLocaleString()}원` : "N/A"}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        리뷰 수
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {reviewCount > 0 ? `${reviewCount.toLocaleString()}개` : "N/A"}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
