// react
import React, { useCallback, useMemo, useEffect, useState, SyntheticEvent } from 'react'
// recoil
import { useRecoilState, useRecoilValue } from 'recoil'
// mui/material
import { colors, Typography, Button, Divider } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import SearchIcon from '@mui/icons-material/Search'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import TextField from '@mui/material/TextField'
// fiftyone
import { registerOperator, useOperatorExecutor } from '@fiftyone/operators'
import { TaxonomyOperator } from '@/operators/TaxonomyOperator'
import * as fos from '@fiftyone/state'
// components
import { CustomTreeItem } from './CustomTreeItem'
import { SearchedImageList } from './SearchedImageList'
import { TaxonomyItem, TaxonomyData } from '@/types/type'
import styled from 'styled-components'
// etc
import httpClient from '@/utils/httpClient'
import { TaxonomyBulder } from '@/core/TaxonomyBuilder'
import _ from 'lodash'

const Container = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: center;
  height: calc(100dvh - 290px);
`

const DetailPanelContent = styled.div`
  overflow-y: hidden;
  overflow-x: hidden;
  color: #c0c0c0;
  margin-bottom: 20px;
  height: 100%;
  width: 90%;
`

const DetailPanelContentTree = styled.div`
  position: relative;
  overflow-y: hidden;
`

const DetailPanelContentTreeBoxHeader = styled.div`
  font-size: 1.1rem;
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #c0c0c0;
`

const DetailPanelContentTreeBoxBody = styled.div`
  overflow-y: auto;
  height: calc(100% - 120px);

  &::-webkit-scrollbar {
    background: rgba(0, 0, 0, 0.2);
    width: 5px;
    height: 5px;
    border-radius: 20px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(245, 245, 245, 0.2);
    border-radius: 20px;
  }
`
const DetailPanelContentTreeBoxes = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  overflow-y: hidden;
`

const DetailPanelContentTreeBox = styled.div`
  width: 32.8%;
  overflow-y: hidden;
  height: calc(100vh - 320px);
`

const TextFieldBox = styled.div`
  overflow-y: auto;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  padding: 5px;
`

const ActionBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const selectedNodeIds = [] as string[]
let selectedTaxonomies1 = [] as TaxonomyData[]
let selectedTaxonomies2 = [] as TaxonomyData[]
let selectedTaxonomies3 = [] as TaxonomyData[]

function Taxonomy() {
  const [treeItems1, settreeItems1] = useState([] as TaxonomyItem[])
  const [treeItems2, settreeItems2] = useState([] as TaxonomyItem[])
  const [treeItems3, settreeItems3] = useState([] as TaxonomyItem[])
  const [images, setImages] = useState([] as string[])
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // const taxonomyExecutor = useOperatorExecutor('@voxel51/taxonomy_plugin/create_taxonomy')
  const dataset = useRecoilState(fos.dataset) as any
  // const view = useRecoilValue(fos.view)
  // const filters = useRecoilValue(fos.filters)

  useEffect(() => {
    ;(async () => {
      await fetchTaxonomyData()
    })()
  }, [])

  const fetchTaxonomyData = async () => {
    const items1 = [] as TaxonomyItem[]
    const items2 = [] as TaxonomyItem[]
    const items3 = [] as TaxonomyItem[]
    const builder = new TaxonomyBulder()
    await builder.execute(items1, items2, items3)

    // [Memo] To avoid re-paint after the initial display when using an Operator, retrieve the data without using an Operator
    // await taxonomyExecutor.execute({ items1, items2, items3 })

    settreeItems1(items1)
    settreeItems2(items2)
    settreeItems3(items3)
  }

  const setSourceDataTraverseTree = (selectedNodeIds: string[], treeItems: TaxonomyItem[], treeId: number) => {    
    const selectedSourceDatas = [] as TaxonomyData[]
    selectedNodeIds.forEach((id) => {
      function traverseTree(item: TaxonomyItem) {
        if (item.id.toString() === id) {
          selectedSourceDatas.push(item.sourceData!)
        }
        item.children?.forEach(traverseTree)
      }

      treeItems.forEach(traverseTree)
    })

    switch (treeId) {
      case 1:
        selectedTaxonomies1 = selectedSourceDatas
        break
      case 2:
        selectedTaxonomies2 = selectedSourceDatas
        break
      case 3:
        selectedTaxonomies3 = selectedSourceDatas
        break
    }
  }

  const onSelectedItemsChange1 = (event: SyntheticEvent, ids: string[]) => setSourceDataTraverseTree(ids, treeItems1, 1)

  const onSelectedItemsChange2 = (event: SyntheticEvent, ids: string[]) => setSourceDataTraverseTree(ids, treeItems2, 2)

  const onSelectedItemsChange3 = (event: SyntheticEvent, ids: string[]) => setSourceDataTraverseTree(ids, treeItems3, 3)

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => setSearchText(event.target.value)

  const onClickSearch = async () => {
    setIsLoading(true)
    const concatTaxonomies = _.concat(selectedTaxonomies1, selectedTaxonomies2, selectedTaxonomies3)

    try {
      const formData = new FormData()
      formData.append('startDate', '')
      formData.append('endDate', '')
      formData.append('text', searchText)
      formData.append('targetTableForText', 'EmbeddedImages_v6')
      formData.append('tags', JSON.stringify(concatTaxonomies))
      formData.append('targetTableForTags', 'tag_table_EmbeddedImages_v6_Updated_NT_2')
      const response = await httpClient.post('/v1/searchByTaxonomyv2', formData)

      // console.log(response.data.searchedSimilarImages)
      setImages(response.data.searchedSimilarImages)
    } finally {
      setIsLoading(false)
    }
  }

  // Test Code (Python Operator)
  // const count = searchExecutor.result?.count || -1;
  // const onClickCount = () => {
  //   searchExecutor.execute();
  // };

  return (
    <React.StrictMode>
      <Container>
        <DetailPanelContent>
          <DetailPanelContentTree>
            <DetailPanelContentTreeBoxHeader
              style={{
                width: '200px',
                margin: '0 auto',
                textAlign: 'center',
                paddingTop: '2px',
                border: '1px solid #c0c0c0',
              }}
            >
              Driving Situation
            </DetailPanelContentTreeBoxHeader>
            <div
              style={{
                borderLeft: '1px solid #c0c0c0',
                height: '28px',
                position: 'absolute',
                left: '50%',
                top: '29px',
              }}
            ></div>
            <div
              style={{
                borderLeft: '1px solid #c0c0c0',
                height: '14px',
                position: 'absolute',
                left: '16%',
                top: '40px',
              }}
            ></div>
            <div
              style={{
                borderLeft: '1px solid #c0c0c0',
                height: '14px',
                position: 'absolute',
                left: '84%',
                top: '40px',
              }}
            ></div>
            <div
              style={{
                borderBottom: '1px solid white',
                height: '1px',
                width: '34%',
                position: 'absolute',
                left: '16%',
                top: '40px',
              }}
            ></div>
            <div
              style={{
                borderBottom: '1px solid white',
                height: '1px',
                width: '34%',
                position: 'absolute',
                left: '50%',
                top: '40px',
              }}
            ></div>
            <DetailPanelContentTreeBoxes>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Scenery Elements</DetailPanelContentTreeBoxHeader>
                <DetailPanelContentTreeBoxBody>
                  {treeItems1.length && (
                    <RichTreeView
                      multiSelect
                      checkboxSelection
                      items={treeItems1}
                      slots={{ item: CustomTreeItem }}
                      onSelectedItemsChange={onSelectedItemsChange1}
                    />
                  )}
                </DetailPanelContentTreeBoxBody>
              </DetailPanelContentTreeBox>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Environmental Condition</DetailPanelContentTreeBoxHeader>
                <DetailPanelContentTreeBoxBody>
                  {treeItems2.length && (
                    <RichTreeView
                      multiSelect
                      checkboxSelection
                      items={treeItems2}
                      slots={{ item: CustomTreeItem }}
                      onSelectedItemsChange={onSelectedItemsChange2}
                    />
                  )}
                </DetailPanelContentTreeBoxBody>
              </DetailPanelContentTreeBox>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Dynamic Elements</DetailPanelContentTreeBoxHeader>
                <DetailPanelContentTreeBoxBody>
                  {treeItems3.length && (
                    <RichTreeView
                      multiSelect
                      checkboxSelection
                      items={treeItems3}
                      slots={{ item: CustomTreeItem }}
                      onSelectedItemsChange={onSelectedItemsChange3}
                    />
                  )}
                </DetailPanelContentTreeBoxBody>
              </DetailPanelContentTreeBox>
            </DetailPanelContentTreeBoxes>
          </DetailPanelContentTree>
        </DetailPanelContent>
      </Container>

      <TextFieldBox>
        <textarea rows={1} placeholder="Please enter the content you want to search for." style={{ width: '80%' }} onChange={onChangeText}>
          {searchText}
        </textarea>
      </TextFieldBox>

      <ActionBox>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          style={{ width: '400px', border: '1px solid white', color: 'white', display: !isLoading ? 'inherit' : 'none' }}
          onClick={onClickSearch}
        >
          <span>Search</span>
        </Button>
        <CircularProgress style={{ display: isLoading ? 'block' : 'none' }} />
      </ActionBox>

      <Divider style={{ marginTop: '20px' }}></Divider>

      <SearchedImageList images={images}></SearchedImageList>
    </React.StrictMode>
  )
}

export default Taxonomy

registerOperator(TaxonomyOperator, '@voxel51/taxonomy_plugin')
