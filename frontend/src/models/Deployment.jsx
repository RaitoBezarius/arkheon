export function Deployment(props) {
  return (
    <p>Deployment done at {props.deployment.created_at} by {props.deployment.operator_id}</p>
  );
}
