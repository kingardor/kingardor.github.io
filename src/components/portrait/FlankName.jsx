import './flank.css'

/**
 * "AKASH  JAMES." set in wide-shot photo space, for PortraitStage's
 * `midground` slot: each word's inner end tucks behind his head. The stage
 * only renders the midground on the wide shot; it fades as you scroll.
 */
export default function FlankName() {
  return (
    <div className="ptn" aria-hidden="true">
      <span className="ptn-a">AKASH</span>
      <span className="ptn-b">JAMES<b>.</b></span>
    </div>
  )
}
