const date = new Intl.DateTimeFormat("en-GB", {
  timeStyle: "medium",
  dateStyle: "short",
}).format;

export function Deployment(props) {
  return (
    <div class="tags has-addons mt-1">
      <span class="tag is-dark is-family-monospace">
        {date(new Date(props.created_at))}
      </span>

      <a class="tag is-family-monospace" href={`/diff/${props.id}`}>
        {props.toplevel}
      </a>

      <span class="tag is-link">
        by&nbsp;<b>{props.operator_id}</b>
      </span>
    </div>
  );
}
