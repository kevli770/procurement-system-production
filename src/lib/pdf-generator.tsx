// lib/pdf-generator.tsx
// PDF generation for Purchase Orders using @react-pdf/renderer

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

// Register Hebrew font - use a CDN that supports CORS
Font.register({
  family: 'Heebo',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/heebo@4.5.11/files/heebo-hebrew-400-normal.woff',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/heebo@4.5.11/files/heebo-hebrew-700-normal.woff',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Heebo',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottom: '2 solid #000',
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1 solid #ccc',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1 solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e0e0e0',
  },
  tableCol1: { width: '10%' },
  tableCol2: { width: '25%' },
  tableCol3: { width: '25%' },
  tableCol4: { width: '15%' },
  tableCol5: { width: '10%' },
  tableCol6: { width: '15%' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666',
    fontSize: 8,
    borderTop: '1 solid #ccc',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    padding: 8,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
    borderTop: '2 solid #000',
  },
});

type POLineItem = {
  itemSku?: string | null;
  itemName: string;
  itemDescription?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type PurchaseOrderData = {
  poNumber: string;
  date: string;
  status: string;
  supplier: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  company: {
    name: string;
    logo?: string | null;
  };
  createdBy: {
    name: string;
    email: string;
  };
  remarks?: string | null;
  lineItems: POLineItem[];
  totalAmount: number;
  createdAt: string;
  approvedAt?: string | null;
};

export const PurchaseOrderPDF = ({ po }: { po: PurchaseOrderData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Purchase Order / הזמנת רכש</Text>
          <Text style={styles.subtitle}>PO Number: {po.poNumber}</Text>
          <Text style={styles.subtitle}>
            Date: {new Date(po.date).toLocaleDateString('en-US')}
          </Text>
        </View>
        {po.company.logo && (
          <View style={styles.headerRight}>
            <Image src={po.company.logo} style={styles.logo} />
          </View>
        )}
      </View>

      {/* Supplier and Company Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supplier Information / פרטי ספק</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Supplier Name:</Text>
          <Text style={styles.value}>{po.supplier.name}</Text>
        </View>
        {po.supplier.email && (
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{po.supplier.email}</Text>
          </View>
        )}
        {po.supplier.phone && (
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{po.supplier.phone}</Text>
          </View>
        )}
        {po.supplier.address && (
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{po.supplier.address}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Information / פרטי חברה</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Company Name:</Text>
          <Text style={styles.value}>{po.company.name}</Text>
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items / פריטים</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>SKU</Text>
            <Text style={styles.tableCol2}>Name</Text>
            <Text style={styles.tableCol3}>Description</Text>
            <Text style={styles.tableCol4}>Unit Price</Text>
            <Text style={styles.tableCol5}>Qty</Text>
            <Text style={styles.tableCol6}>Total</Text>
          </View>
          {po.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{item.itemSku || '-'}</Text>
              <Text style={styles.tableCol2}>{item.itemName}</Text>
              <Text style={styles.tableCol3}>{item.itemDescription || '-'}</Text>
              <Text style={styles.tableCol4}>₪{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.tableCol5}>{item.quantity}</Text>
              <Text style={styles.tableCol6}>₪{item.lineTotal.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={{ width: '85%', textAlign: 'right' }}>Total Amount:</Text>
            <Text style={{ width: '15%' }}>₪{po.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Remarks */}
      {po.remarks && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remarks / הערות</Text>
          <Text>{po.remarks}</Text>
        </View>
      )}

      {/* Status Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{po.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created By:</Text>
          <Text style={styles.value}>{po.createdBy.name} ({po.createdBy.email})</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.value}>
            {new Date(po.createdAt).toLocaleString('en-US')}
          </Text>
        </View>
        {po.approvedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Approved At:</Text>
            <Text style={styles.value}>
              {new Date(po.approvedAt).toLocaleString('en-US')}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated by Procurement System on {new Date().toLocaleString('en-US')}</Text>
        <Text>This is an official purchase order document</Text>
      </View>
    </Page>
  </Document>
);

// Helper function to generate PDF buffer for email attachments
export async function generatePOPDF(poId: string): Promise<Buffer> {
  const { prisma } = await import('./prisma');
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const { createElement } = await import('react');

  // Fetch purchase order with all details
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      supplier: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      company: {
        select: {
          name: true,
          logo: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      lineItems: {
        select: {
          itemSku: true,
          itemName: true,
          itemDescription: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!purchaseOrder) {
    throw new Error('Purchase Order not found');
  }

  // Convert dates to strings for PDF component
  const poData = {
    ...purchaseOrder,
    date: purchaseOrder.date.toISOString(),
    createdAt: purchaseOrder.createdAt.toISOString(),
    approvedAt: purchaseOrder.approvedAt?.toISOString(),
    submittedAt: purchaseOrder.submittedAt?.toISOString(),
  };

  // Generate PDF
  const pdfDocument = createElement(PurchaseOrderPDF, { po: poData }) as React.ReactElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(pdfDocument as any);

  return Buffer.from(pdfBuffer);
}
