
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Receipt, FileCheck } from "lucide-react";

import NotasLista from "../components/documentos/NotasLista";
import RecibosLista from "../components/documentos/RecibosLista";

export default function Documentos() {
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Documentos
          </h1>
          <p className="text-slate-600 mt-1">Gerencie notas de serviço e recibos</p>
        </div>

        <Tabs defaultValue="notas" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="notas" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Notas de Serviço
            </TabsTrigger>
            <TabsTrigger value="recibos" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Recibos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notas" className="space-y-6">
            <NotasLista />
          </TabsContent>

          <TabsContent value="recibos" className="space-y-6">
            <RecibosLista />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
