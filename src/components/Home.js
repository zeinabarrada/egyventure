import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

export default function Home() {
  let cardArr = [];
  return (
    <div className="row" style={{ marginTop: "4%", marginLeft: "2%" }}>
      {cardArr.map((eachCard, index) => (
        <div className="col-md-3" style={{ marginBottom: "4%" }}>
          <Card style={{ width: "18rem", height: "65vh" }}>
            <Card.Img style={{ height: "20vh" }} variant="top" src="" />
            <Card.Body>
              <Card.Title>{eachCard.title}</Card.Title>
              <Card.Text style={{ height: "27vh" }}>{eachCard.text}</Card.Text>
              <Button variant="primary" href={`${eachCard.link}`}>
                Info
              </Button>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
}
