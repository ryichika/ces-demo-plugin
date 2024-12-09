import styled from 'styled-components'

const Container = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: center;
  width: 100%;
`

const ImageList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`

function SearchedImageList(props: { images: any[] }) {
  return (
    <Container>
      <ImageList>
        {props.images.map((image, index) => (
          <img src={`${image.sas_url}`} style={{ width: '100%', objectFit: 'cover' }} loading="lazy" />
        ))}
      </ImageList>
    </Container>
  )
}

export { SearchedImageList }
