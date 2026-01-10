import { describe, expect, it } from 'vitest'
import { NS } from '../../packages/svgcanvas/core/namespaces.js'
import HistoryRecordingService from '../../packages/svgcanvas/core/historyrecording.js'

const createSvgElement = (name) => document.createElementNS(NS.SVG, name)

describe('HistoryRecordingService', () => {
  it('does not record empty batch commands', () => {
    const stack = []
    const hrService = new HistoryRecordingService({
      addCommandToHistory (cmd) {
        stack.push(cmd)
      }
    })

    hrService.startBatchCommand('Empty').endBatchCommand()
    expect(stack).toHaveLength(0)
  })

  it('does not record nested empty batch commands', () => {
    const stack = []
    const hrService = new HistoryRecordingService({
      addCommandToHistory (cmd) {
        stack.push(cmd)
      }
    })

    hrService.startBatchCommand('Outer').startBatchCommand('Inner').endBatchCommand().endBatchCommand()
    expect(stack).toHaveLength(0)
  })

  it('records subcommands as a single batch command', () => {
    const stack = []
    const hrService = new HistoryRecordingService({
      addCommandToHistory (cmd) {
        stack.push(cmd)
      }
    })

    const svg = createSvgElement('svg')
    const rect = createSvgElement('rect')
    svg.append(rect)

    hrService.startBatchCommand('Batch').insertElement(rect).endBatchCommand()
    expect(stack).toHaveLength(1)
    expect(stack[0].type()).toBe('BatchCommand')
    expect(stack[0].stack).toHaveLength(1)
    expect(stack[0].stack[0].type()).toBe('InsertElementCommand')
  })

  it('NO_HISTORY does not throw and does not record', () => {
    const svg = createSvgElement('svg')
    const rect = createSvgElement('rect')
    svg.append(rect)

    expect(() => {
      HistoryRecordingService.NO_HISTORY.startBatchCommand('Noop').insertElement(rect).endBatchCommand()
    }).not.toThrow()
  })
})
