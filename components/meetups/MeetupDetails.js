import { Fragment } from "react/jsx-runtime";
import classes from './MeetupDetails.module.css';
export default function MeetupDetails(props) {
    return (
       <Fragment>
        <div className={classes.details}>
          <img src={props.image} alt={props.title} />
           <h1>{props.title}</h1>
            <address>{props.address}</address>
            <p>{props.description}</p>
        </div>
       
       </Fragment>
    )
}
