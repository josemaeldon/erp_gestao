#!/usr/bin/env python3
import io
import json
import sys
from datetime import datetime

from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether


def build_pdf(payload):
    buffer = io.BytesIO()
    width, height = A4
    styles = getSampleStyleSheet()
    body = ParagraphStyle('Body', parent=styles['BodyText'], fontName='Helvetica', fontSize=11, leading=18, alignment=TA_JUSTIFY, textColor=colors.HexColor('#28363f'))
    title = ParagraphStyle('Title', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=17, leading=22, alignment=TA_CENTER, spaceAfter=12, textColor=colors.HexColor('#1f3342'))
    header = ParagraphStyle('Header', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=15, alignment=TA_CENTER, textColor=colors.HexColor('#1f3342'))
    small = ParagraphStyle('Small', parent=styles['BodyText'], fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor('#65737b'))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#d7d2ca'))
        canvas.line(24*mm, 18*mm, width-24*mm, 18*mm)
        canvas.setFont('Helvetica', 7.5)
        canvas.setFillColor(colors.HexColor('#65737b'))
        canvas.drawString(24*mm, 12*mm, payload.get('footer', 'Documento emitido pelo Núcleo Eclesial.'))
        canvas.drawRightString(width-24*mm, 12*mm, f"Página {doc.page}")
        canvas.restoreState()

    doc = BaseDocTemplate(buffer, pagesize=A4, leftMargin=24*mm, rightMargin=24*mm, topMargin=22*mm, bottomMargin=24*mm, title=payload.get('title', 'Documento'))
    doc.addPageTemplates(PageTemplate(id='document', frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')], onPage=footer))

    validation_url = payload.get('validation_url', '')
    qr_code = qr.QrCodeWidget(validation_url or payload.get('validation_code', ''))
    bounds = qr_code.getBounds()
    size = 30*mm
    drawing = Drawing(size, size, transform=[size/(bounds[2]-bounds[0]),0,0,size/(bounds[3]-bounds[1]),0,0])
    drawing.add(qr_code)

    metadata = payload.get('metadata', {})
    metadata_rows = [[Paragraph(f'<b>{key}</b>', small), Paragraph(str(value or '-'), small)] for key, value in metadata.items() if value not in (None, '')]
    metadata_table = Table(metadata_rows or [['Documento', payload.get('document_type', '-')]], colWidths=[42*mm, 74*mm])
    metadata_table.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),colors.HexColor('#f1eee9')),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#d7d2ca')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))

    story = [Paragraph(payload.get('header', 'PARÓQUIA'), header), Spacer(1, 3*mm), Table([['']], colWidths=[doc.width], rowHeights=[.6*mm], style=[('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#b86f4d'))]), Spacer(1, 12*mm), Paragraph(payload.get('title', 'DOCUMENTO'), title), Spacer(1, 8*mm)]
    if payload.get('body'):
        story.extend([Paragraph(payload.get('body', ''), body), Spacer(1, 8*mm)])
    report_table = payload.get('table')
    if report_table and report_table.get('columns'):
        columns = report_table['columns']
        rows = [[Paragraph(f'<b>{str(column)}</b>', small) for column in columns]]
        rows.extend([[Paragraph(str(value or '-'), small) for value in row] for row in report_table.get('rows', [])])
        widths = [doc.width / len(columns)] * len(columns)
        data_table = Table(rows, colWidths=widths, repeatRows=1, hAlign='LEFT')
        data_table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#1f3342')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#d7d2ca')),('VALIGN',(0,0),(-1,-1),'TOP'),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f7f5f1')]),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
        story.extend([data_table, Spacer(1, 10*mm)])
    story.extend([metadata_table, Spacer(1, 18*mm)])
    if payload.get('report'):
        story.append(Paragraph(f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", small))
        doc.build(story)
        return buffer.getvalue()
    signature = Table([['', ''], [Paragraph('_________________________________<br/>Responsável pela emissão', small), drawing], [Paragraph(payload.get('organization', ''), small), Paragraph(f"Validação: <b>{payload.get('validation_code','')}</b><br/>Leia o QR Code para validar.", small)]], colWidths=[110*mm, 42*mm], rowHeights=[3*mm, 31*mm, 17*mm])
    signature.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'MIDDLE'),('ALIGN',(1,0),(1,-1),'CENTER')]))
    story.append(KeepTogether(signature))
    story.append(Spacer(1, 8*mm))
    story.append(Paragraph(f"Emitido em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", small))
    doc.build(story)
    return buffer.getvalue()


if __name__ == '__main__':
    data = json.load(sys.stdin)
    sys.stdout.buffer.write(build_pdf(data))
