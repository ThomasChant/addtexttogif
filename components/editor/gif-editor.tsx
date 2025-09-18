'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {v4 as uuid} from 'uuid';
import {Download, Pause, Play, Upload, Wand2} from 'lucide-react';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {Textarea} from '../ui/textarea';
import {Label} from '../ui/label';
import {Slider} from '../ui/slider';
import {Badge} from '../ui/badge';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {GifFrame, OverlayItem, RenderResult} from '../../lib/editor-types';
import {formatDuration, parseGif, renderGif} from '../../lib/gif';
import {getTemplate, overlayTemplates} from '../../lib/templates';

interface GifEditorProps {
  id: string;
}

interface DragState {
  overlayId: string | null;
  offsetX: number;
  offsetY: number;
}

export function GifEditor({id}: GifEditorProps) {
  const t = useTranslations('Editor');
  const [frames, setFrames] = useState<GifFrame[]>([]);
  const [dimensions, setDimensions] = useState({width: 0, height: 0});
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<DragState>({overlayId: null, offsetX: 0, offsetY: 0});

  const frameOffsets = useMemo(() => {
    let acc = 0;
    return frames.map((frame) => {
      const start = acc;
      acc += frame.delay;
      return {start, end: acc};
    });
  }, [frames]);

  const currentFrameIndex = useMemo(() => {
    if (!frames.length) return 0;
    const index = frameOffsets.findIndex((frame) => currentTime >= frame.start && currentTime < frame.end);
    return index === -1 ? frames.length - 1 : index;
  }, [currentTime, frameOffsets, frames.length]);

  const currentFrame = frames[currentFrameIndex];

  useEffect(() => {
    if (!isPlaying || !frames.length) return;
    let animationFrame: number | null = null;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      setCurrentTime((previous) => {
        const next = previous + delta;
        if (totalDuration === 0) return next;
        return next % totalDuration;
      });
      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, frames.length, totalDuration]);

  useEffect(() => {
    if (!frames.length) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [frames]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const result = await parseGif(file);
      setFrames(result.frames);
      setDimensions({width: result.width, height: result.height});
      setTotalDuration(result.totalDuration);
      setCurrentTime(0);
      setOverlays([]);
      setRenderResult(null);
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : t('errors.generic'));
    }
  };

  const handleAddOverlay = () => {
    if (!frames.length) return;
    const defaultTemplate = overlayTemplates[0];
    const defaultTotal = totalDuration || 4000;
    const overlay: OverlayItem = {
      id: uuid(),
      text: t('defaults.overlayText'),
      start: 0,
      end: Math.max(500, Math.min(defaultTotal, 4000)),
      x: 0.5,
      y: 0.8,
      templateId: defaultTemplate.id
    };
    setOverlays((items) => [...items, overlay]);
  };

  const handleUpdateOverlay = (id: string, updates: Partial<OverlayItem>) => {
    setOverlays((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const next = {...item, ...updates};
        const safeTotal = totalDuration || 1000;
        const clampedStart = Math.min(Math.max(next.start, 0), Math.max(safeTotal - 100, 0));
        const clampedEnd = Math.max(clampedStart + 100, Math.min(next.end, safeTotal));
        return {...next, start: clampedStart, end: clampedEnd};
      })
    );
  };

  const handleDeleteOverlay = (id: string) => {
    setOverlays((items) => items.filter((item) => item.id !== id));
  };

  const handleTimelineChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleRender = async () => {
    try {
      setIsRendering(true);
      setError(null);
      const result = await renderGif(frames, overlays, dimensions);
      setRenderResult(result);
    } catch (renderError) {
      setError(renderError instanceof Error ? renderError.message : t('errors.generic'));
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    return () => {
      if (renderResult?.blobUrl) {
        URL.revokeObjectURL(renderResult.blobUrl);
      }
    };
  }, [renderResult?.blobUrl]);

  const activeOverlays = overlays.filter(
    (overlay) => currentTime >= overlay.start && currentTime <= overlay.end
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, overlay: OverlayItem) => {
    const container = previewRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    dragState.current = {
      overlayId: overlay.id,
      offsetX: x / rect.width - overlay.x,
      offsetY: y / rect.height - overlay.y
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = previewRef.current;
    const {overlayId, offsetX, offsetY} = dragState.current;
    if (!container || !overlayId) return;
    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - offsetX;
    const y = (event.clientY - rect.top) / rect.height - offsetY;
    const nextX = Math.min(Math.max(x, 0.05), 0.95);
    const nextY = Math.min(Math.max(y, 0.05), 0.95);
    handleUpdateOverlay(overlayId, {x: nextX, y: nextY});
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.overlayId = null;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  };

  const frameList = useMemo(() => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {frames.map((frame, index) => (
        <div key={frame.id} className="rounded-lg border bg-muted/30 p-2">
          <img src={frame.dataUrl} alt={`Frame ${index + 1}`} className="w-full rounded-md" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('timeline.frameLabel', {index: index + 1})}</span>
            <span>{formatDuration(frame.delay)}</span>
          </div>
        </div>
      ))}
    </div>
  ), [frames, t]);

  const downloadLink = renderResult ? (
    <Button
      asChild
      className="w-full"
      variant="secondary"
      disabled={!renderResult}
    >
      <a href={renderResult.blobUrl} download={renderResult.fileName}>
        <Download className="mr-2 h-4 w-4" />
        {t('actions.downloadGif')}
      </a>
    </Button>
  ) : null;

  return (
    <section id={id} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-xl border p-4">
                <Label htmlFor="gif-upload" className="font-medium">
                  {t('upload.label')}
                </Label>
                <Input id="gif-upload" type="file" accept="image/gif" onChange={handleFileChange} />
                <p className="text-sm text-muted-foreground">{t('upload.hint')}</p>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {frames.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                    <Upload className="mb-3 h-8 w-8" />
                    <p>{t('upload.placeholder')}</p>
                  </div>
                ) : null}
              </div>

              {frames.length > 0 ? (
                <div className="space-y-4">
                  <div
                    ref={previewRef}
                    className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black"
                    style={{maxHeight: 480}}
                  >
                    {currentFrame ? (
                      <img
                        key={currentFrame.id}
                        src={currentFrame.dataUrl}
                        alt={t('preview.alt', {index: currentFrameIndex + 1})}
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    ) : null}

                    {activeOverlays.map((overlay) => {
                      const template = getTemplate(overlay.templateId);
                      return (
                        <div
                          key={overlay.id}
                          role="button"
                          tabIndex={0}
                          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-move select-none"
                          style={{
                            left: `${overlay.x * 100}%`,
                            top: `${overlay.y * 100}%`
                          }}
                          onPointerDown={(event) => handlePointerDown(event, overlay)}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                        >
                          <span
                            className="block whitespace-pre-wrap text-center text-white"
                            style={{
                              fontFamily: template.fontFamily,
                              fontSize: template.fontSize,
                              fontWeight: template.fontWeight ?? 600,
                              color: template.color,
                              background: template.backgroundColor,
                              padding: `${template.padding / 16}rem`,
                              borderRadius: template.borderRadius,
                              boxShadow: template.shadow ?? '0 0 0 rgba(0,0,0,0)'
                            }}
                          >
                            {overlay.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsPlaying((value) => !value)} disabled={!frames.length}>
                          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                          {isPlaying ? t('actions.pause') : t('actions.play')}
                        </Button>
                        <Badge variant="secondary">{t('timeline.total', {duration: formatDuration(totalDuration)})}</Badge>
                        <span className="text-sm text-muted-foreground">{t('timeline.position', {current: formatDuration(currentTime)})}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setCurrentTime(0)}>
                        {t('actions.resetPlayback')}
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Slider
                        max={Math.max(totalDuration, 1)}
                        min={0}
                        step={10}
                        value={[currentTime]}
                        onValueChange={handleTimelineChange}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('overlays.title')}</h3>
                  <Button size="sm" onClick={handleAddOverlay} disabled={!frames.length}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {t('actions.addOverlay')}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t('overlays.description')}</p>

                <div className="mt-4 space-y-4">
                  {overlays.map((overlay) => {
                    const template = getTemplate(overlay.templateId);
                    return (
                      <div key={overlay.id} className="space-y-3 rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{t('overlays.itemTitle')}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteOverlay(overlay.id)}
                          >
                            {t('actions.remove')}
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`text-${overlay.id}`}>{t('overlays.fields.text')}</Label>
                          <Textarea
                            id={`text-${overlay.id}`}
                            value={overlay.text}
                            onChange={(event) => handleUpdateOverlay(overlay.id, {text: event.target.value})}
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`start-${overlay.id}`}>{t('overlays.fields.start')}</Label>
                            <Input
                              id={`start-${overlay.id}`}
                              type="number"
                              min={0}
                              max={overlay.end - 100}
                              step={100}
                              value={overlay.start}
                              onChange={(event) =>
                                handleUpdateOverlay(overlay.id, {start: Number(event.target.value)})
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`end-${overlay.id}`}>{t('overlays.fields.end')}</Label>
                            <Input
                              id={`end-${overlay.id}`}
                              type="number"
                              min={overlay.start + 100}
                              max={totalDuration}
                              step={100}
                              value={overlay.end}
                              onChange={(event) =>
                                handleUpdateOverlay(overlay.id, {end: Number(event.target.value)})
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`template-${overlay.id}`}>{t('overlays.fields.template')}</Label>
                          <select
                            id={`template-${overlay.id}`}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={overlay.templateId}
                            onChange={(event) => handleUpdateOverlay(overlay.id, {templateId: event.target.value})}
                          >
                            {overlayTemplates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                        <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                          <p>{t('overlays.hints.drag')}</p>
                          <p>{t('overlays.hints.duration')}</p>
                        </div>
                      </div>
                    );
                  })}
                  {overlays.length === 0 ? (
                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      {t('overlays.empty')}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border p-4">
                <h3 className="text-lg font-semibold">{t('export.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('export.description')}</p>
                <Button onClick={handleRender} disabled={!frames.length || overlays.length === 0 || isRendering}>
                  {isRendering ? t('actions.rendering') : t('actions.renderGif')}
                </Button>
                {downloadLink}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {frames.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('timeline.framesTitle')}</CardTitle>
            <CardDescription>{t('timeline.framesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>{frameList}</CardContent>
        </Card>
      ) : null}
    </section>
  );
}
